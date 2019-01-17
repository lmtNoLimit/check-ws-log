const fs = require('fs');
const path = require('path');

module.exports = function checkVpbs(file, messageType, threshold) {
    let arr = fs.readFileSync(path.resolve(__dirname, `./logs/ssi/${file}`))
        .toString()
        .match(/^.+$/gm)
        .filter(line => line.match(new RegExp(`"${messageType}"`)))
        .map(item => item.slice(9, 17))
        .map(item => new Date(`January 1, 2019 ${item}`).getTime());
    let count = 0;
    // console.log(arr);
    let data = [`${file} - ${messageType}`];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i+1] && arr[i + 1] - arr[i] > threshold) {
            data.push(`${new Date(arr[i]).toLocaleString().slice(9)} - ${new Date(arr[i + 1]).toLocaleString().slice(9)} -> ${(arr[i + 1] - arr[i])/1000}s`);
            count++;
        }
    }
    data.push(`Total: ${count}`);
    // console.log(count)
    fs.writeFile(`./reports/ssi/${file}_${messageType}`, data.join('\n'), err => err ? console.log(err) : 'Success');
    // return {
    //     file,
    //     messageType, 
    //     count
    // };
}