const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

code = code.replace(
  /\} else if \(itemName === '도서\/소형물품\(소박스용\)'\) \{\s*cbm = \(materialSettings\['소박스'\] \|\| 0\) \* item\.quantity;\s*\}/g,
  `} else if (itemName === '도서/소형물품(소박스용)') {
                cbm = (materialSettings['소박스'] || 0) * item.quantity;
              } else if (itemName === '기타물품1' || itemName === '기타물품2') {
                cbm = (materialSettings[item.variantName] || 0) * item.quantity;
              }`
);

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('wizardStore updated');
