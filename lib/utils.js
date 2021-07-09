'use strict';

const readLine = require('readline');

const utils = {

    askUser(question) {
        return new Promise((resolve) => {
            const rl = readLine.createInterface({
                input: process.stdin, output: process.stdout
            });
            rl.question(question, answer => {
                rl.close();
                resolve(answer);
            });
        });
    }

}

module.exports = utils;