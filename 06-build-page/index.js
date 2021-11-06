const chalk = require('chalk'); //https://www.npmjs.com/package/chalk
const fs = require('fs').promises;
const path = require('path');
const process = require('process');

class PageBuilder {
    stat = fs.stat;

    constructor(dest) {
        this.projectDir = path.join(__dirname, dest);
        process.on('exit', () => this.sayGoodBye());
    }

    async build() {
        console.log('enter Build');
        this.makeDir(this.projectDir).then(() => {
            console.log('enter make dir ' + this.projectDir);
            const assets = path.join(this.projectDir, '/assets');
            this.makeDir(assets).then(() => {
                this.makeDir(path.join(assets, '/fonts'));
                this.makeDir(path.join(assets, '/img'));
                this.makeDir(path.join(assets, '/svg'));
            });
        }).then(() => {
        })
    }

    async makeDir(dir) {
        console.log(`Enter to make ${dir}`);
        await fs.rm(dir, {recursive: true}, (err) => {
            if (!err) console.log(chalk.blue(`Directory ${dir} deleted`));
        });
        await fs.mkdir(dir, {recursive: true}, (err) => {
            if (err) console.log(chalk.red(err));
            console.log(chalk.green(`Directory ${dir} created`));
        });
    }

    copyDir(source, destDir) {
        fs.readdir(source, {withFileTypes: true}, (err, files) => {
            if (err) console.log(chalk.red(err));
            files.forEach((file) => {
                if (file.isFile()) {
                    this.copyFile(file, destDir);
                }
            });
        });
    }

    async copyFile(source, destDir) {
        await fs.copyFile(source, destDir, (err) => {
            if (err) throw err;
            console.log(`File ${source} copied to ${destDir}`);
        })
    }

    async readFile(fileName) {
        try {
            const data = await fs.readFile(fileName);
            console.log(data.toString());
            return data.toString();
        } catch (err) {
            console.error(`Got an error trying to read the file ${fileName}: ${err.message}`);
        }
    }

    async writeFile(fileName, text) {
        try {
            await fs.writeFile(fileName, text, {flag: 'a'});
        } catch (err) {
            console.error(`Got an error trying to write to a file ${fileName}: ${err.message}`);
        }
    }

    sayGoodBye() {
        console.log(chalk.blueBright('Good luck!'));
    }
}

const pageBuilder = new PageBuilder('/project-dist');
pageBuilder.build();
