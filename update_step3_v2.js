const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

const effect = \
  // 동적 포장재료 연동 (TV, 대형가전/가구 등)
  useEffect(() => {
    let tv50 = 0, tv65 = 0, tv85 = 0;
    let bed = 0, drawer = 0, fridge = 0, kimchiL = 0, kimchiM = 0, washer = 0, dryer = 0;
    let sofa = 0, piano = 0, wardrobe = 0;

    Object.values(roomItems).forEach(room => {
      // TV
      if (room.items['TV']) {
        room.items['TV'].forEach(inst => {
          if (inst.variantName.includes('50인치')) tv50 += inst.quantity;
          if (inst.variantName.includes('65~75')) tv65 += inst.quantity;
          if (inst.variantName.includes('85인치')) tv85 += inst.quantity;
        });
      }
      // 침대(W)
      if (room.items['침대(W)']) {
        room.items['침대(W)'].forEach(inst => bed += inst.quantity);
      }
      // 서랍장
      if (room.items['서랍장']) {
        room.items['서랍장'].forEach(inst => drawer += inst.quantity);
      }
      // 냉장고
      if (room.items['냉장고']) {
        room.items['냉장고'].forEach(inst => fridge += inst.quantity);
      }
      // 김치냉장고
      if (room.items['김치냉장고']) {
        room.items['김치냉장고'].forEach(inst => {
          if (inst.variantName.includes('4룸')) kimchiL += inst.quantity;
          else kimchiM += inst.quantity;
        });
      }
      // 세탁기
      if (room.items['세탁기']) {
        room.items['세탁기'].forEach(inst => washer += inst.quantity);
      }
      // 건조기
      if (room.items['건조기']) {
        room.items['건조기'].forEach(inst => dryer += inst.quantity);
      }
      // 쇼파
      if (room.items['쇼파'] || room.items['소파']) {
        (room.items['쇼파'] || []).forEach(inst => sofa += inst.quantity);
        (room.items['소파'] || []).forEach(inst => sofa += inst.quantity);
      }
      // 피아노
      if (room.items['피아노']) {
        room.items['피아노'].forEach(inst => piano += inst.quantity);
      }
      // 장롱 -> 분해장농
      if (room.items['장롱']) {
        room.items['장롱'].forEach(inst => wardrobe += inst.quantity);
      }
    });

    const newMaterials = { ...resources.materials };
    const sync = (key, count) => {
      if (count > 0 || newMaterials[key] !== undefined) {
        newMaterials[key] = count;
      }
    };

    sync('TV(50인치이하)', tv50);
    sync('TV(65~75인치)', tv65);
    sync('TV(85인치이상)', tv85);
    sync('침대비닐커버', bed);
    sync('침대', bed);
    sync('서랍장', drawer);
    sync('냉장고', fridge);
    sync('김치냉장고(대)', kimchiL);
    sync('김치냉장고(중)', kimchiM);
    sync('세탁기', washer);
    sync('건조기', dryer);
    // sync('쇼파', sofa);
    // sync('피아노', piano);
    // sync('분해장농', wardrobe);

    const hasChanges = Object.keys(newMaterials).some(key => newMaterials[key] !== resources.materials[key]);

    if (hasChanges) {
      updateResources({ materials: newMaterials });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomItems, updateResources]);
\;

// Replace existing useEffect
code = code.replace(/\/\/ 동적 포장재료 연동[\s\S]*?eslint-disable-next-line react-hooks\/exhaustive-deps\n  }, \[roomItems, updateResources\]\);/, effect.trim());

// Update filter condition
const filterCode = \PACKING_MATERIALS.filter(mat => {
                  const hideWhenZero = ['TV(', '침대', '서랍장', '냉장고', '김치냉장고', '세탁기', '건조기', '쇼파', '분해장농', '피아노'];
                  if (hideWhenZero.some(prefix => mat.startsWith(prefix))) {
                    return (resources.materials[mat] || 0) > 0;
                  }
                  return true;
                }).map(mat =>\;

code = code.replace(/PACKING_MATERIALS\.filter\([\s\S]*?return true;\n                }\)\.map\(mat =>/, filterCode);

fs.writeFileSync('src/app/(wizard)/step3/page.tsx', code);
console.log('done');
