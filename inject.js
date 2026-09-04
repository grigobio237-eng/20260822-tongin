const fs = require('fs');
let c = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

const effect = \
  // 동적 포장재료 연동 (TV 등)
  useEffect(() => {
    let tv50 = 0;
    let tv65 = 0;
    let tv85 = 0;

    Object.values(roomItems).forEach(room => {
      if (room.items['TV']) {
        room.items['TV'].forEach(inst => {
          if (inst.variantName.includes('50인치')) tv50 += inst.quantity;
          if (inst.variantName.includes('65~75')) tv65 += inst.quantity;
          if (inst.variantName.includes('85인치')) tv85 += inst.quantity;
        });
      }
    });

    const newMaterials = { ...resources.materials };
    if (tv50 > 0 || newMaterials['TV(50인치이하)'] !== undefined) newMaterials['TV(50인치이하)'] = tv50;
    if (tv65 > 0 || newMaterials['TV(65~75인치)'] !== undefined) newMaterials['TV(65~75인치)'] = tv65;
    if (tv85 > 0 || newMaterials['TV(85인치이상)'] !== undefined) newMaterials['TV(85인치이상)'] = tv85;

    if (
      resources.materials['TV(50인치이하)'] !== tv50 ||
      resources.materials['TV(65~75인치)'] !== tv65 ||
      resources.materials['TV(85인치이상)'] !== tv85
    ) {
      updateResources({ materials: newMaterials });
    }
  }, [roomItems, resources.materials, updateResources]);

\;

c = c.replace(/  return \(\n    <div className="space-y-8 pb-24">/, effect + '  return (\n    <div className="space-y-8 pb-24">');
fs.writeFileSync('src/app/(wizard)/step3/page.tsx', c);
console.log('done');
