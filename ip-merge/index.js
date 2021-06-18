/* Simple node script to merge 2 IP blocklists into a single one for use with Synology */

const fs = require('fs');
const path = require('path');

function makeSet(file) {
  const split = file.split(/\r?\n/);
  const set = new Set();

  split.forEach(ip => set.add(ip));
  return set;
}

const myFile = fs.readFileSync(path.join(__dirname, 'mylist.txt'), 'UTF-8');
const theirFile = fs.readFileSync(path.join(__dirname, 'deny-ip-list.txt'), 'UTF-8');
const additional = fs.readFileSync(path.join(__dirname, 'logged-ips.txt'), 'UTF-8');

const mySet = makeSet(myFile);
const theirSet = makeSet(theirFile);
const additionalSet = makeSet(additional);
console.log(`My list size: ${mySet.size}`);
console.log(`Their list size: ${theirSet.size}`);
console.log(`Additional list size: ${additionalSet.size}`);
const merged = new Set();
mySet.forEach(ip => merged.add(ip));
theirSet.forEach(ip => merged.add(ip));
additionalSet.forEach(ip => merged.add(ip));
console.log(`Merged size: ${merged.size}`);

console.log(`New Entires: ${merged.size - mySet.size}`);

// 10.0.0.0 - 10.255.255.255, 172.16.0.0 - 172.31.255.255, 192.168.0.0 - 192.168.255.255
const localRegex = new RegExp(/(^10\.)|(^192\.168\.)|(^172\.(1[6-9]|2[0-9]|3[0-1])\.)/);

let combined = "";
merged.forEach((ip) => {
  // Do not add local and reserved ips
  if (!localRegex.test(ip)) {
    combined = combined.concat(`${ip}\n`);
  } else {
    console.log(`ignoring local ip ${ip}`);
  }
});

fs.writeFileSync(path.join(__dirname, 'combined.txt'), combined);
