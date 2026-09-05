const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

// In addRoomItemInstance
code = code.replace(
  "if (itemName === '옷' || itemName === '이불' || itemName === '생활물품(잔짐류)') {",
  "if (itemName === '옷' || itemName === '이불' || itemName === '생활물품/잔짐류(중박스용)' || itemName === '도서/소형물품(소박스용)') {"
);

code = code.replace(
  "if (itemName === '생활물품(잔짐류)') defaultUnitCbm = materialSettings['중박스'] || 0;",
  "if (itemName === '생활물품/잔짐류(중박스용)') defaultUnitCbm = materialSettings['중박스'] || 0;\n            if (itemName === '도서/소형물품(소박스용)') defaultUnitCbm = materialSettings['소박스'] || 0;"
);

// In recalculateCbm
code = code.replace(
  "} else if (itemName === '생활물품(잔짐류)') {",
  "} else if (itemName === '생활물품/잔짐류(중박스용)') {"
);

code = code.replace(
  "cbm = (materialSettings['중박스'] || 0) * item.quantity;",
  "cbm = (materialSettings['중박스'] || 0) * item.quantity;\n              } else if (itemName === '도서/소형물품(소박스용)') {\n                cbm = (materialSettings['소박스'] || 0) * item.quantity;"
);

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('done');
