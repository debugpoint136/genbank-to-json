const genbankToJson = require('bio-parsers').genbankToJson;
const fs = require('fs');
const path = require('path');
const FILENAME = process.argv[2];
if (!FILENAME) {
  console.log('node index.js sample.gb');
  process.exit(0);
}
const fileContents = fs.readFileSync(path.join(__dirname, `${FILENAME}`), 'utf-8');

const ALL = [];

const gbFiles = fileContents.split('//\n');
gbFiles.forEach(file => {
  if (file !== '\n') {
    let VERSION;
    genbankToJson(file, function(result) {
      let extraLinesBlob  = result[0].parsedSequence.extraLines;
      let res = []
      let start = 0;
      extraLinesBlob.forEach((row,i)  => {
        let linesParts = row.split(' ');
        if (linesParts[0] !== '') {
          start = 0;
          if (linesParts[0] === 'VERSION') {
            linesParts.forEach(element => {
              if (element.trim() !== 'VERSION' && element.trim() !== '') {
                VERSION = element;
                result[0].VERSION = element;
              }
            });
          }
        } else {
          
          if (linesParts[2] === 'ORGANISM') {
            start = 1;
          }
        }
        if (start === 1) {
          if (linesParts[2] !== 'ORGANISM') {
            res.push(row.trim());
          }
        }
      });

      let tmp = {}

      tmp.accession = VERSION,
      tmp.lineage = res[0];
      let toPrint = {...tmp, ...result[0].parsedSequence.features[0].notes};

      ALL.push(toPrint);
      result[0].extraLines_organism = res;
      result[0].accession = VERSION,
      result[0].lineage = res[0];
      // console.log(JSON.stringify(result));
      
    });
  }
});

console.log(JSON.stringify(ALL)); // will print skinny