const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step2/page.tsx', 'utf8');

const target1 = `if (itemName === '옷' || itemName === '이불') {
              cbm = (materialSettings[inst.variantName] || 0) * inst.quantity;
            } else if (itemName === '생활물품/잔짐류(중박스용)') {
              cbm = (materialSettings['중박스'] || 0) * inst.quantity;
            } else if (itemName === '도서/소형물품(소박스용)') {
              cbm = (materialSettings['소박스'] || 0) * inst.quantity;
            }`;
const replace1 = `if (itemName === '옷' || itemName === '이불' || itemName.startsWith('기타물품')) {
              cbm = (materialSettings[inst.variantName] || 0) * inst.quantity;
            } else if (itemName === '생활물품/잔짐류(중박스용)' || itemName === '신발류(중박스용)') {
              cbm = (materialSettings['중박스'] || 0) * inst.quantity;
            } else if (itemName === '도서/소형물품(소박스용)') {
              cbm = (materialSettings['소박스'] || 0) * inst.quantity;
            }`;

code = code.replace(target1, replace1);

const target2 = `if (itemName === '옷' || itemName === '이불') {
                  const matCbm = materialSettings[firstVariant.name];
                  if (matCbm !== undefined) defCbm = matCbm;
                } else if (itemName === '생활물품/잔짐류(중박스용)') {
                  const matCbm = materialSettings['중박스'];
                  if (matCbm !== undefined) defCbm = matCbm;
                } else if (itemName === '도서/소형물품(소박스용)') {
                  const matCbm = materialSettings['소박스'];
                  if (matCbm !== undefined) defCbm = matCbm;
                }`;
const replace2 = `if (itemName === '옷' || itemName === '이불' || itemName.startsWith('기타물품')) {
                  const matCbm = materialSettings[firstVariant.name];
                  if (matCbm !== undefined) defCbm = matCbm;
                } else if (itemName === '생활물품/잔짐류(중박스용)' || itemName === '신발류(중박스용)') {
                  const matCbm = materialSettings['중박스'];
                  if (matCbm !== undefined) defCbm = matCbm;
                } else if (itemName === '도서/소형물품(소박스용)') {
                  const matCbm = materialSettings['소박스'];
                  if (matCbm !== undefined) defCbm = matCbm;
                }`;

code = code.replace(target2, replace2);

const target3 = `if (itemName === '옷' || itemName === '이불') {
                        displayCbm = materialSettings[inst.variantName] || 0;
                      } else if (itemName === '생활물품/잔짐류(중박스용)') {
                        displayCbm = materialSettings['중박스'] || 0;
                      } else if (itemName === '도서/소형물품(소박스용)') {
                        displayCbm = materialSettings['소박스'] || 0;
                      }`;
const replace3 = `if (itemName === '옷' || itemName === '이불' || itemName.startsWith('기타물품')) {
                        displayCbm = materialSettings[inst.variantName] || 0;
                      } else if (itemName === '생활물품/잔짐류(중박스용)' || itemName === '신발류(중박스용)') {
                        displayCbm = materialSettings['중박스'] || 0;
                      } else if (itemName === '도서/소형물품(소박스용)') {
                        displayCbm = materialSettings['소박스'] || 0;
                      }`;

code = code.replace(target3, replace3);

fs.writeFileSync('src/app/(wizard)/step2/page.tsx', code);
console.log('step2 done');
