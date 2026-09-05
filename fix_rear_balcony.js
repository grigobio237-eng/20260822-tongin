const fs = require('fs');
let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

const targetRegex = /\{\s*name:\s*'세탁기',\s*variants:\s*KITCHEN_ITEMS\.find.*?\.variants\s*\},?\n\s*\{\s*name:\s*'건조기',\s*variants:\s*KITCHEN_ITEMS\.find.*?\.variants\s*\}/;

const replacement = `{
    name: '세탁기',
    variants: [
      { name: '통돌이/소형', cbm: 0.6 },
      { name: '드럼 세탁기 (기본)', cbm: 0.8, isDefault: true },
      { name: '워시타워 (일체형)', cbm: 1.5 },
    ]
  },
  { name: '건조기', variants: createStandardVariants(0.4, 0.8, 1.0) }`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync('src/lib/constants/items.ts', code);
  console.log('Fixed REAR_BALCONY_ITEMS');
} else {
  console.log('targetRegex not found');
}
