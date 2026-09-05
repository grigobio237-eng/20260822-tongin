const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

const target1 = `let clothes = 0, blankets = 0, mediumBox = 0, smallBox = 0;

    Object.values(roomItems).forEach(room => {`;
const replace1 = `let clothes = 0, blankets = 0, mediumBox = 0, smallBox = 0;
    let dynamicCounts: Record<string, number> = {};

    Object.values(roomItems).forEach(room => {
      ['기타물품1', '기타물품2'].forEach(key => {
        if (room.items[key]) {
          room.items[key].forEach(inst => {
            dynamicCounts[inst.variantName] = (dynamicCounts[inst.variantName] || 0) + inst.quantity;
          });
        }
      });
      if (room.items['신발류(중박스용)']) {
        room.items['신발류(중박스용)'].forEach(inst => mediumBox += inst.quantity);
      }`;

code = code.replace(target1, replace1);

fs.writeFileSync('src/app/(wizard)/step3/page.tsx', code);
console.log('step3 fixed');
