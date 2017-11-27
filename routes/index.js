var express = require('express');
var router = express.Router();
var path = require('path');
var XLSX = require('xlsx');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});

router.get('/data', function(req, res) {
    var workbook = XLSX.readFile('resource/records.xlsx');
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    xlData.forEach(function(info) {
        info.id = parseFloat(info.id);
        info['txnt id'] = parseFloat(info['txnt id']);
        info.quantity = parseFloat(info.quantity);
        info.amount = parseFloat(info.amount);
    });
    res.json(xlData);
});

module.exports = router;