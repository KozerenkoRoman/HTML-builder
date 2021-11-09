const fs = require('fs');
const path = require('path');
const process = require('process');

class MergeCSS {
    stat = fs.stat;

    constructor(sourceName, destName) {
        this.source = path.join(__dirname, sourceName);
        this.dest = path.join(__dirname, destName, '/bundle.css');
        process.on('exit', () => this.sayGoodBye());
    }

    merge() {
        fs.writeFile(this.dest, '', function (err) { //Clear destination file
            if (err) console.log(err);
        });
        fs.readdir(this.source, {withFileTypes: true}, (err, files) => {
            if (err) console.log(err);
            files.forEach((file) => {
                if (file.isFile() && path.extname(file.name) === '.css') {
                    this.readFile(file.name).then(result => {
                        fs.appendFile(this.dest, result, function (err) {
                            if (err) console.log(err);
                        });
                    });
                }
            });
        });
    }

    async readFile(file) {
        const chunks = [];
        const readableStream = fs.createReadStream(path.join(this.source, `/${file}`), 'utf-8');
        for await (let chunk of readableStream) {
            chunks.push(chunk);
        }
        console.log(`File ${file} has been read`);
        return chunks.toString();
    }

    sayGoodBye() {
        console.log('Good luck!');
    }
}

const mergeCSS = new MergeCSS('/styles', '/project-dist');
mergeCSS.merge();
