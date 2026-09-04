const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

// Ensure useEffect is imported
if (!code.includes('useEffect')) {
  code = code.replace(/import React, { useState, useMemo } from 'react';/, "import React, { useState, useMemo, useEffect } from 'react';");
}

const useEffectHook = \
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
    if (tv50 > 0 || newMaterials['TV(50인치이하)']) newMaterials['TV(50인치이하)'] = tv50;
    if (tv65 > 0 || newMaterials['TV(65~75인치)']) newMaterials['TV(65~75인치)'] = tv65;
    if (tv85 > 0 || newMaterials['TV(85인치이상)']) newMaterials['TV(85인치이상)'] = tv85;

    // 만약 다른 단일 품목들도 동기화하려면 여기에 추가할 수 있습니다.
    
    // updateResources({ materials: newMaterials }) 호출 시 무한루프 방지를 위해
    // 값이 실제로 변경되었는지 확인
    if (
      resources.materials['TV(50인치이하)'] !== tv50 ||
      resources.materials['TV(65~75인치)'] !== tv65 ||
      resources.materials['TV(85인치이상)'] !== tv85
    ) {
      updateResources({ materials: newMaterials });
    }
  }, [roomItems]); // mount 시 또는 roomItems 변경 시 실행
\;

if (!code.includes('동적 포장재료 연동')) {
  // Insert before return (
  code = code.replace(/  return \(/, useEffectHook + '\n  return (');
  fs.writeFileSync('src/app/(wizard)/step3/page.tsx', code);
  console.log('Injected useEffect');
} else {
  console.log('Already injected');
}
