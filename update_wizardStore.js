const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

const target1 = `if (itemName === '옷' || itemName === '이불') {
              const matCbm = materialSettings[defaultVariantName];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            } else if (itemName === '생활물품/잔짐류(중박스용)') {
              const matCbm = materialSettings['중박스'];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            } else if (itemName === '도서/소형물품(소박스용)') {
              const matCbm = materialSettings['소박스'];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            }`;
const replace1 = `if (itemName === '옷' || itemName === '이불') {
              const matCbm = materialSettings[defaultVariantName];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            } else if (itemName === '생활물품/잔짐류(중박스용)' || itemName === '신발류(중박스용)') {
              const matCbm = materialSettings['중박스'];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            } else if (itemName === '도서/소형물품(소박스용)') {
              const matCbm = materialSettings['소박스'];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            } else if (itemName === '기타물품1' || itemName === '기타물품2') {
              const matCbm = materialSettings[defaultVariantName];
              if (matCbm !== undefined) {
                defaultUnitCbm = matCbm;
              }
            }`;

code = code.replace(target1, replace1);

const target2 = `if (itemName === '옷' || itemName === '이불') {
              const matCbm = materialSettings[inst.variantName];
              if (matCbm !== undefined) {
                newInst.unitCbm = matCbm;
              }
            } else if (itemName === '생활물품/잔짐류(중박스용)') {
              const matCbm = materialSettings['중박스'];
              if (matCbm !== undefined) {
                newInst.unitCbm = matCbm;
              }
            } else if (itemName === '도서/소형물품(소박스용)') {
              const matCbm = materialSettings['소박스'];
              if (matCbm !== undefined) {
                newInst.unitCbm = matCbm;
              }
            }`;
const replace2 = `if (itemName === '옷' || itemName === '이불' || itemName === '기타물품1' || itemName === '기타물품2') {
              const matCbm = materialSettings[inst.variantName];
              if (matCbm !== undefined) {
                newInst.unitCbm = matCbm;
              }
            } else if (itemName === '생활물품/잔짐류(중박스용)' || itemName === '신발류(중박스용)') {
              const matCbm = materialSettings['중박스'];
              if (matCbm !== undefined) {
                newInst.unitCbm = matCbm;
              }
            } else if (itemName === '도서/소형물품(소박스용)') {
              const matCbm = materialSettings['소박스'];
              if (matCbm !== undefined) {
                newInst.unitCbm = matCbm;
              }
            }`;

code = code.replace(target2, replace2);

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('wizardStore done');
