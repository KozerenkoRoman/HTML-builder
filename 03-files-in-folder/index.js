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
            if (err) process.stdout.write(err);
            files.forEach((file) => {
                if (file.isFile()) {
                    const ext = path.extname(file.name);
                    const fileName = path.basename(file.name, ext);
                    this.stat(path.join(this.path, file.name), (err, stats) => {
                        process.stdout.write(`${fileName}-${ext.slice(1)}` + '-' + `${stats.size}b\n`);
                    });
                }
            });
        });
    }

    sayGoodBye() {
        process.stdout.write('Good luck!\n');
    }
}

folderInfo = new FolderInfo('/secret-folder');
folderInfo.readDir()
