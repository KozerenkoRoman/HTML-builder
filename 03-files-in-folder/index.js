const chalk = require('chalk'); //https://www.npmjs.com/package/chalk
const fs = require('fs');
const path = require('path');
const process = require('process');

class FolderInfo {
    stat = fs.stat;

    constructor(folderName) {
        this.path = path.join(__dirname, folderName);
        process.on('exit', () => this.sayGoodBye());
    }

    readDir() {
        fs.readdir(this.path, {withFileTypes: true}, (err, files) => {
            if (err) process.stdout.write(chalk.red(err));
            files.forEach((file) => {
                if (file.isFile()) {
                    const ext = path.extname(file.name);
                    const fileName = path.basename(file.name, ext);
                    this.stat(path.join(this.path, file.name), (err, stats) => {
                        process.stdout.write(chalk.bold(`${fileName}-${ext.slice(1)}`) + '-' + chalk.green(`${stats.size}b\n`));
                    });
                }
            });
        });
    }

    sayGoodBye() {
        process.stdout.write(chalk.blueBright('Good luck!\n'));
    }
}

folderInfo = new FolderInfo('/secret-folder');
folderInfo.readDir()
