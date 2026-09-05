const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

code = code.replace(/Object\.entries\(roomData\.items\)\.forEach/g, 'Object.entries(roomData?.items || {}).forEach');

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('wizardStore patched again');
