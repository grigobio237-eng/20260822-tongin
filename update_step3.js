const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

const target1 = `let mediumBox = 0;
    let smallBox = 0;

    Object.values(roomItems).forEach(room => {`;
const replace1 = `let mediumBox = 0;
    let smallBox = 0;
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
      }
`;

code = code.replace(target1, replace1);

const target2 = `    sync('대박스(옷)', clothes);
    sync('특대박스(이불)', blankets);
    sync('중박스', mediumBox);
    sync('소박스', smallBox);

    const hasChanges = Object.keys(newMaterials).some(key => newMaterials[key] !== resources.materials[key]);`;

const replace2 = `    sync('대박스(옷)', clothes + (dynamicCounts['대박스(옷)'] || 0));
    sync('특대박스(이불)', blankets + (dynamicCounts['특대박스(이불)'] || 0));
    sync('중박스', mediumBox + (dynamicCounts['중박스'] || 0));
    sync('소박스', smallBox + (dynamicCounts['소박스'] || 0));
    
    // For all other materials in dynamicCounts not explicitly synced above
    Object.entries(dynamicCounts).forEach(([matName, count]) => {
      if (!['대박스(옷)', '특대박스(이불)', '중박스', '소박스'].includes(matName)) {
        // If they chose 'TV(50인치이하)' as 기타물품, we add it to the existing count in newMaterials
        // Wait, newMaterials[matName] is already set by sync() for known items, so we should add to it.
        // Actually, some items like tv50 are synced BEFORE this. So we can just ADD to newMaterials.
        if (newMaterials[matName] !== undefined) {
           newMaterials[matName] += count;
        } else {
           newMaterials[matName] = count;
        }
      }
    });

    const hasChanges = Object.keys(newMaterials).some(key => newMaterials[key] !== resources.materials[key]);`;

code = code.replace(target2, replace2);

fs.writeFileSync('src/app/(wizard)/step3/page.tsx', code);
console.log('step3 done');
