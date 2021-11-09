const fs = require('fs');
const path = require('path');
const process = require('process');

class FileReader {
    stdout = process.stdout;

    constructor(fileName) {
        this.file = path.join(__dirname, fileName);
    }

    readFile() {
        const readableStream = fs.createReadStream(this.file, 'utf-8');
        readableStream.on('data', (chunk) => {
            this.stdout.write(chunk)
        });
    }

    sayGoodBye() {
        process.on('exit', () => this.stdout.write('Good luck!\n'));
    }
}

const fileReader = new FileReader('text.txt');
fileReader.readFile();
fileReader.sayGoodBye();

