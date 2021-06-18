const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, 'log.csv'));
const data = parse(text, {
  columns: true,
  from_line: 2,
  relax_column_count_less: true,
  skip_empty_lines: true,
});

const ips = new Set();
data.forEach(element => {
  if (element.Event.indexOf('failed to log in') !== -1) {
    const ip = element.Event.match(/([0-9]{1,3}\.){3}([0-9]{1,3})/);
    ips.add(ip[0]);
  }
});

let merged = "";
ips.forEach(ip => merged = merged.concat(`${ip}\n`));
console.log(`Made a list of ${ips.size} blocked ips`);

fs.writeFileSync(path.join(__dirname, 'ips.txt'), merged);