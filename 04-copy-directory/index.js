const chalk = require('chalk'); //https://www.npmjs.com/package/chalk
const fs = require('fs');
const path = require('path');
const process = require('process');

class CopyDirectory {
    stat = fs.stat;

    constructor(dirName) {
        this.source = path.join(__dirname, dirName);
        this.dest = path.join(__dirname, dirName + '-copy');
        process.on('exit', () => this.sayGoodBye());
    }

    execute() {
        this.rmDir();
    }

    rmDir() {
        fs.rm(this.dest, {recursive: true}, (err) => {
            if (err) console.log(chalk.red(err));
            console.log(chalk.blue(`Directory ${this.dest} deleted`));
            this.mkDir();
        });
    }

    mkDir() {
        fs.mkdir(this.dest, {recursive: true}, (err) => {
            if (err) console.log(chalk.red(err));
            console.log(chalk.green(`Directory ${this.dest} created`));
            this.copyDir()
        });
    }

    copyDir() {
        fs.readdir(this.source, {withFileTypes: true}, (err, files) => {
            if (err) console.log(chalk.red(err));
            files.forEach((file) => {
                if (file.isFile()) {
                    this.copyFile(file);
                }
            });
        });
    }

    copyFile(file) {
        let sourceName = path.join(this.source, `/${file.name}`);
        let distName = path.join(this.dest, `/${file.name}`);
        fs.copyFile(sourceName, distName, (err) => {
            if (err) throw err;
            console.log(`File ${file.name} copied`);
        })
    }

    sayGoodBye() {
        console.log(chalk.blueBright('Good luck!'));
    }
}

const copyDirectory = new CopyDirectory('/files');
copyDirectory.execute();
