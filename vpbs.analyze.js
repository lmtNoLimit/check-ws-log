const fs = require('fs');
const path = require('path');

module.exports = function checkVpbs(file, messageType, threshold) {
    let arr = fs.readFileSync(path.resolve(__dirname, `./logs/vpbs/${file}`))
        .toString()
        .match(/^.+$/gm)
        .filter(line => line.match(new RegExp(`"${messageType}"`)))
        .map(item => item.slice(10, 18))
        .map(item => new Date(`January 1, 2019 ${item}`).getTime());
    // console.log(arr);
        let count = 0;
    let data = [`${file} - ${messageType}`];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i+1] && arr[i + 1] - arr[i] > threshold) {
            data.push(`${new Date(arr[i]).toLocaleString().slice(9)} - ${new Date(arr[i + 1]).toLocaleString().slice(9)} -> ${(arr[i + 1] - arr[i])/1000}s`);
            count++;
        }
    }
    data.push(`Total: ${count}`);
    fs.writeFile(`./reports/vpbs/${file}_${messageType}`, data.join('\n'), err => err ? console.log(err) : 'Success');
    return {
        file,
        messageType, 
        count
    };
}