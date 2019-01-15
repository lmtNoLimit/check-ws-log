const fs = require('fs');
const path = require('path');

module.exports = function check(file, messageType, threshold) {
    let arr = fs.readFileSync(path.resolve(__dirname, `./logs/${file}`))
        .toString()
        .match(/^.+$/gm)
        .filter(line => line.match(new RegExp(messageType)))
        .map(item => item.slice(21, 29))
        .map(item => new Date(`January 1, 2019 ${item}`).getTime());
    let count = 0;
    let data = [`${file} - ${messageType}`];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i + 1] - arr[i] > threshold) {
            data.push(`${new Date(arr[i]).toLocaleString().slice(9)} - ${new Date(arr[i + 1]).toLocaleString().slice(9)} -> ${(arr[i + 1] - arr[i])/1000}s`);
            count++;
        }
    }
    data.push(`Total: ${count}`);
    if (count !== 0) {
        fs.writeFile(`./reports/${file}_${messageType}`, data.join('\n'), err => err ? console.log(err) : 'Success');
    }
    return {
        file,
        messageType, 
        count
    };
}