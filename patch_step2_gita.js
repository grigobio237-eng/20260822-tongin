const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step2/page.tsx', 'utf8');

// 1. subtotal
code = code.replace(
  /if \(itemName === '옷'\) cbm = \(materialSettings\['대박스\(옷\)'\] \|\| 0\) \* inst\.quantity;\s*if \(itemName === '이불'\) cbm = \(materialSettings\['특대박스\(이불\)'\] \|\| 0\) \* inst\.quantity;\s*if \(itemName === '생활물품\/잔짐류\(중박스용\)'\) cbm = \(materialSettings\['중박스'\] \|\| 0\) \* inst\.quantity;\s*if \(itemName === '도서\/소형물품\(소박스용\)'\) cbm = \(materialSettings\['소박스'\] \|\| 0\) \* inst\.quantity;/g,
  `if (itemName === '옷') cbm = (materialSettings['대박스(옷)'] || 0) * inst.quantity;
              if (itemName === '이불') cbm = (materialSettings['특대박스(이불)'] || 0) * inst.quantity;
              if (itemName === '생활물품/잔짐류(중박스용)') cbm = (materialSettings['중박스'] || 0) * inst.quantity;
              if (itemName === '도서/소형물품(소박스용)') cbm = (materialSettings['소박스'] || 0) * inst.quantity;
              if (itemName === '기타물품1' || itemName === '기타물품2') cbm = (materialSettings[inst.variantName] || 0) * inst.quantity;`
);

// 2. defCbm
code = code.replace(
  /let defCbm = def\.cbm;\s*if \(item\.name === '옷'\) defCbm = materialSettings\['대박스\(옷\)'\] \|\| 0;\s*if \(item\.name === '이불'\) defCbm = materialSettings\['특대박스\(이불\)'\] \|\| 0;\s*if \(item\.name === '생활물품\/잔짐류\(중박스용\)'\) defCbm = materialSettings\['중박스'\] \|\| 0;\s*if \(item\.name === '도서\/소형물품\(소박스용\)'\) defCbm = materialSettings\['소박스'\] \|\| 0;/g,
  `let defCbm = def.cbm;
                    if (item.name === '옷') defCbm = materialSettings['대박스(옷)'] || 0;
                    if (item.name === '이불') defCbm = materialSettings['특대박스(이불)'] || 0;
                    if (item.name === '생활물품/잔짐류(중박스용)') defCbm = materialSettings['중박스'] || 0;
                    if (item.name === '도서/소형물품(소박스용)') defCbm = materialSettings['소박스'] || 0;
                    if (item.name === '기타물품1' || item.name === '기타물품2') defCbm = materialSettings[def.name] || 0;`
);

// 3. displayCbm
code = code.replace(
  /let displayCbm = inst\.unitCbm;\s*if \(item\.name === '옷'\) displayCbm = materialSettings\['대박스\(옷\)'\] \|\| 0;\s*if \(item\.name === '이불'\) displayCbm = materialSettings\['특대박스\(이불\)'\] \|\| 0;\s*if \(item\.name === '생활물품\/잔짐류\(중박스용\)'\) displayCbm = materialSettings\['중박스'\] \|\| 0;\s*if \(item\.name === '도서\/소형물품\(소박스용\)'\) displayCbm = materialSettings\['소박스'\] \|\| 0;/g,
  `let displayCbm = inst.unitCbm;
                    if (item.name === '옷') displayCbm = materialSettings['대박스(옷)'] || 0;
                    if (item.name === '이불') displayCbm = materialSettings['특대박스(이불)'] || 0;
                    if (item.name === '생활물품/잔짐류(중박스용)') displayCbm = materialSettings['중박스'] || 0;
                    if (item.name === '도서/소형물품(소박스용)') displayCbm = materialSettings['소박스'] || 0;
                    if (item.name === '기타물품1' || item.name === '기타물품2') displayCbm = materialSettings[inst.variantName] || 0;`
);

// 4. Modal mapping
code = code.replace(
  /\{modalState\.item\.variants\.map\(\(v, i\) => \(\s*<div/g,
  `{modalState.item.variants.map((v, i) => {
                  let modalVariantCbm = v.cbm;
                  if (modalState.item.name === '옷') modalVariantCbm = materialSettings['대박스(옷)'] || 0;
                  if (modalState.item.name === '이불') modalVariantCbm = materialSettings['특대박스(이불)'] || 0;
                  if (modalState.item.name === '생활물품/잔짐류(중박스용)') modalVariantCbm = materialSettings['중박스'] || 0;
                  if (modalState.item.name === '도서/소형물품(소박스용)') modalVariantCbm = materialSettings['소박스'] || 0;
                  if (modalState.item.name === '기타물품1' || modalState.item.name === '기타물품2') modalVariantCbm = materialSettings[v.name] || 0;
                  return (
                  <div`
);

code = code.replace(
  /onClick=\{\(\) => handleVariantSelect\(v\.name, v\.cbm\)\}/g,
  `onClick={() => handleVariantSelect(v.name, typeof modalVariantCbm !== 'undefined' ? modalVariantCbm : v.cbm)}`
);

code = code.replace(
  /<p className="text-sm text-gray-500">\{v\.cbm\} CBM<\/p>/g,
  `<p className="text-sm text-gray-500">{typeof modalVariantCbm !== 'undefined' ? modalVariantCbm : v.cbm} CBM</p>`
);

fs.writeFileSync('src/app/(wizard)/step2/page.tsx', code);
console.log('step2 updated');
