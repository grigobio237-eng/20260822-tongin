const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

code = code.replace(/Object\.values\(roomItems\)\.forEach\(room => \{/g, 'Object.values(roomItems).forEach(room => {\n      if (!room || !room.items) return;');

fs.writeFileSync('src/app/(wizard)/step3/page.tsx', code);
console.log('step3 patched');
