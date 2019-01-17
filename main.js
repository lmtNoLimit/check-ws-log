const checkPriceServiceMsg = require('./vnd.analyze');
const checkKafkaMsg = require('./vnd.kafka.analyze');
const checkSSIMsg = require('./ssi.analyze');
const checkVPBSMsg = require('./vpbs.analyze');

let filename = 'capture_2019-01-15 09_56_15.dat'
checkKafkaMsg(filename, 'stock', '10', 2e4);
// checkPriceServiceMsg(
//     '2019_01_14_vn30-am.log', 'STOCK', 20e3
// );

// checkSSIMsg(
//     '2019_01_17_ssi_hose_am.log',
//     'HOSE_QUOTE',
//     10e3
// );

// checkVPBSMsg(
//     '2019_01_17_vpbs_hose_am.log',
//     'board',
//     10e3
// )