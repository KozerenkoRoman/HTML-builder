const chalk = require('chalk'); //https://www.npmjs.com/package/chalk
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
                console.log(chalk.blue(`Directory ${dir} deleted`));
            })
        } catch (err) {
            console.log(chalk.blue(`No such directory ${dir} for delete`));
        }
        try {
            await fsp.mkdir(dir, {recursive: true}, (err) => {
                console.log(chalk.green(`Directory ${dir} created`));
            })
        } catch (err) {
            console.log(chalk.red(`Unable to create directory ${dir}`));
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
        const template = await this.readFile(path.join(__dirname, 'template.html'));
        const header = await this.readFile(path.join(__dirname, '/components/header.html'));
        const articles = await this.readFile(path.join(__dirname, '/components/articles.html'));
        const footer = await this.readFile(path.join(__dirname, '/components/footer.html'));
        const result = template.replace('{{header}}', `${header}`).replace('{{articles}}', `${articles}`).replace('{{footer}}', `${footer}`);

        await fsp.writeFile(path.join(this.projectDir, '/index.html'), `${result}`, {flag: 'w'}, error => {
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
        console.log(chalk.blueBright('Good luck!'));
    }
}

const pageBuilder = new PageBuilder('/project-dist');
pageBuilder.build();
