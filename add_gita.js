const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const additionalItems = `  { name: '기타물품1', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },
  { name: '기타물품2', variants: PACKING_MATERIALS.map(m => ({ name: m, cbm: 0 })) },\n];`;

// Append to ROOM_ITEMS
code = code.replace(/  \}\,\n\];/g, '  },\n' + additionalItems);

// Append to LIVING_ROOM_ITEMS
code = code.replace(/  \{ name: '공기청정기'.*?\},\n\];/g, "  { name: '공기청정기', variants: ROOM_ITEMS.find(i => i.name === '공기청정기')!.variants },\n" + additionalItems);

// Append to KITCHEN_ITEMS
code = code.replace(/  \{ name: '식기류'.*?\},\n\];/g, "  { name: '식기류', variants: createStandardVariants(0.1, 0.3, 0.6) },\n" + additionalItems);

// Append to VERANDA_ITEMS
code = code.replace(/  \{ name: '쌀통'.*?\},\n\];/g, "  { name: '쌀통', variants: createStandardVariants(0.05, 0.1, 0.2) },\n" + additionalItems);


fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('Added 기타물품1, 2 to all rooms');
