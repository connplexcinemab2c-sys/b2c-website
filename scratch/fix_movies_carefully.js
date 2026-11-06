const fs = require('fs');
const path = require('path');

const moviesPath = path.join(__dirname, '..', 'Backend', 'src', 'controller', 'user', 'Movies.js');
let content = fs.readFileSync(moviesPath, 'utf8');

const marker = 'export const moviesShowByCinema = async (req, res) => {';
const parts = content.split(marker);
if (parts.length !== 2) {
    console.error('Expected exactly 2 parts when splitting on marker');
    process.exit(1);
}

let funcBody = parts[1];

// 1. Replace the heavy unused Movie.find block
const target1 = /const moviesDetails = await Movie\.find\(\{[\s\S]*?const cinemas = await Cinema\.find\(\{[\s\S]*?\n\s*\}\);/m;
const repl1 = `const cinemaIds = [];
    if (
      cinemaDetails &&
      (!regionId || cinemaDetails.regionId?.toString() == regionId?.toString()) &&
      cinemaDetails.displayName
    ) {
      cinemaIds.push(cinemaDetails._id);
    }`;

if (!target1.test(funcBody)) {
    console.error('target1 not found in funcBody');
    process.exit(1);
}
funcBody = funcBody.replace(target1, repl1);
console.log('Target 1 replaced in moviesShowByCinema');

// 2. Remove redundant cinemaIds loop and dead filmCodes
const target2 = /const cinemaIds = \[\];\s*cinemas\.map\([\s\S]*?\}\);\s*\n/m;
if (!target2.test(funcBody)) {
    console.error('target2 not found in funcBody');
    process.exit(1);
}
funcBody = funcBody.replace(target2, '');
console.log('Target 2 replaced in moviesShowByCinema');

const target3 = /if \(moviesDetails\.uniqueFilmCode\) \{[\s\S]*?matchstage\.filmCode = \{[\s\S]*?\};\s*\n\s*\}/m;
if (!target3.test(funcBody)) {
    console.error('target3 not found in funcBody');
    process.exit(1);
}
funcBody = funcBody.replace(target3, '');
console.log('Target 3 replaced in moviesShowByCinema');

content = parts[0] + marker + funcBody;
fs.writeFileSync(moviesPath, content);
console.log('Successfully saved Movies.js with targeted fixes!');
