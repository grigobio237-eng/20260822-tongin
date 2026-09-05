const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

code = code.replace(
  "{ name: '옷', variants: createStandardVariants(0.1, 0.2, 0.4) },",
  "{ name: '옷', variants: [{ name: '대박스(옷)', cbm: 0, isDefault: true }] },"
);

code = code.replace(
  "{ name: '이불', variants: createStandardVariants(0.1, 0.2, 0.4) },",
  "{ name: '이불', variants: [{ name: '특대박스(이불)', cbm: 0, isDefault: true }] },"
);

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('done');
