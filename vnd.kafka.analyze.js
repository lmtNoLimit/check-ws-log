const fs = require('fs');
const readline = require('readline');
const path = require('path');

module.exports = function checkKafkaMessage(file, type, floor, threshold) {
    const lineReader = readline.createInterface({
        input: require('fs').createReadStream(`./captures/${file}`),
        output: process.stdout,
        console: false,
        terminal: false
    });
    let data = [];
    lineReader.on('line', function (line) {
        try {
            let msg = JSON.parse(line);
            let msgType = msg.content.type;
            if (msgType !== type) return;
            if (msg.content.message.floorCode !== floor) return;
            data.push(msg.content.message);
        } catch (e) {
            console.log(e);
        }
    });
    let result = [];
    let count = 0;
    lineReader.on('close', function() {
        data = data.map(item => Object.assign({}, item,{ 
            newtime: new Date(`January 1, 2019 ${item.time}`).getTime()
        }))
        data = data.sort((a,b) => a.newtime - b.newtime);
        // console.log(data);
        for (let i = 0; i < data.length; i++) {
            if (data[i+1] && data[i+1].newtime - data[i].newtime > threshold) {
                result.push(`${data[i].time} - ${data[i+1].time} -> ${(data[i + 1].newtime - data[i].newtime)/1000}s`);
                count++;
            }
        }
        console.log(result, count)
    })
    // let data = [`${file} - ${messageType}`];
    // for (let i = 0; i < arr.length; i++) {
        // if (arr[i + 1] - arr[i] > threshold) {
        //     data.push(`${new Date(arr[i]).toLocaleString().slice(9)} - ${new Date(arr[i + 1]).toLocaleString().slice(9)} -> ${(arr[i + 1] - arr[i])/1000}s`);
        //     count++;
        // }
    // }
    // data.push(`Total: ${count}`);
    // fs.writeFile(`./reports/${file}_${messageType}`, data.join('\n'), err => err ? console.log(err) : 'Success');
    // return {
    //     file,
    //     messageType, 
    //     count
    // };
}