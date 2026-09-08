const fs = require('fs');

function fix(file) {
  let data = fs.readFileSync(file, 'utf-8');
  // I will just parse the end of the file.
  // There is an error on 537: `)}`
}
