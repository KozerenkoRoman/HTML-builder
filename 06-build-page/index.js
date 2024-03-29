const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const process = require('process');

class PageBuilder {
    stat = fs.stat;

    constructor(dest) {
        this.projectDir = path.join(__dirname, dest);
        process.on('exit', () => this.sayGoodBye());
    }

    async build() {
        await this.makeDir(this.projectDir).then(() => {
            const assets = path.join(this.projectDir, '/assets');
            this.makeDir(assets).then(() => {
                const fonts = path.join(assets, '/fonts');
                const img = path.join(assets, '/img');
                const svg = path.join(assets, '/svg')
                this.makeDir(fonts).then(() => {
                    this.copyDir(path.join(__dirname, '/assets/fonts'), fonts);
                });
                this.makeDir(img).then(() => {
                    this.copyDir(path.join(__dirname, '/assets/img'), img);
                });
                this.makeDir(svg).then(() => {
                    this.copyDir(path.join(__dirname, '/assets/svg'), svg);
                });
            });
        }).then(() => {
            this.createHtmlFile();
        }).then(() => {
            this.createCssFile();
        });
    }

    async makeDir(dir) {
        try {
            await fsp.rm(dir, {recursive: true}, (err) => {
                console.log(`Directory ${dir} deleted`);
            })
        } catch (err) {
            console.log(`No such directory ${dir} for delete`);
        }
        try {
            await fsp.mkdir(dir, {recursive: true}, (err) => {
                console.log(`Directory ${dir} created`);
            })
        } catch (err) {
            console.log(`Unable to create directory ${dir}`);
        }
    }

    async copyDir(source, destDir) {
        const files = await fsp.readdir(source, {withFileTypes: true});
        files.forEach((file) => {
            if (file.isFile()) {
                this.copyFile(source, destDir, file.name);
            }
        });
    }

    async copyFile(source, destDir, file) {
        try {
            await fsp.copyFile(path.join(source, `/${file}`), path.join(destDir, `/${file}`));
            console.log('Copy', source + file, '=>', destDir + file);
        } catch (err) {
            console.log(err);
        }
    }

    async readFile(file) {
        const stream = fs.ReadStream(file);
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return chunks.toString().trim();
    }

    async createHtmlFile() {
        let template = await this.readFile(path.join(__dirname, 'template.html'));
        const componentsPath = path.join(__dirname, '/components');
        const files = await fsp.readdir(componentsPath, {withFileTypes: true});
        for (let file of files) {
            console.log(file.name)
            if (file.isFile() && path.extname(file.name) === '.html') {
                const content = await this.readFile(path.join(componentsPath, `/${file.name}`));
                const fileName = path.basename(file.name, path.extname(file.name));
                template = template.replace(`{{${fileName}}}`, `${content}`);
            }
        }
        await fsp.writeFile(path.join(this.projectDir, '/index.html'), `${template}`, {flag: 'w'}, error => {
            if (error) throw error;
        });
    }

    async createCssFile() {
        const stylesPath = path.join(__dirname, '/styles');
        const files = await fsp.readdir(stylesPath, {withFileTypes: true});
        for (let file of files) {
            console.log(file.name)
            if (file.isFile() && path.extname(file.name) === '.css') {
                const css = await this.readFile(path.join(stylesPath, `/${file.name}`));
                fsp.appendFile(path.join(this.projectDir, '/style.css'), css, {flag: 'a'}, err => {
                    if (err) throw err;
                });
            }
        }
    }

    sayGoodBye() {
        console.log('Good luck!');
    }
}

const pageBuilder = new PageBuilder('/project-dist');
pageBuilder.build();
