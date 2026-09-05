const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const additionalItems = `  { name: '기타물품1', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
  { name: '기타물품2', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
`;

// VERANDA_ITEMS ends with 쌀통
code = code.replace(/  \{ name: '쌀통', variants: createStandardVariants\(0\.05, 0\.1, 0\.2\) \},?\r?\n\];/g, 
  "  { name: '쌀통', variants: createStandardVariants(0.05, 0.1, 0.2) },\n" + additionalItems + "];");

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('Fixed VERANDA_ITEMS');
