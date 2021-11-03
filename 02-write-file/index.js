const chalk = require('chalk'); //https://www.npmjs.com/package/chalk
const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

class FileWriter {
    stdout = process.stdout;
    stdin = process.stdin;
    readLines = readline.createInterface({
        input: this.stdin,
        output: this.stdout,
    });

    constructor(fileName) {
        process.on('exit', () => this.sayGoodBye());
        this.stream = fs.createWriteStream(path.join(__dirname, fileName), 'utf-8');
        this.readLines.on('line', (answer) => this.writeToFile(answer));
    }

    sayGoodBye() {
        this.stdout.write(chalk.blueBright('Good luck!\n'));
        this.readLines.close();
        process.exit(0);
    }

    sayHello() {
        this.stdout.write(chalk.bold('Please enter any text\n'));
    }

    writeToFile(answer) {
        console.log(answer);
        if (answer === 'exit') {
            this.readLines.close();
            process.exit(0);
        }
        this.stream.write(`${answer}\n`);
    }
}

const fileWriter = new FileWriter('text.txt');
fileWriter.writeToFile('');
fileWriter.sayHello();





