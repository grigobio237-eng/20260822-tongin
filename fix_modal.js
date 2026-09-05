const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step2/page.tsx', 'utf8');

code = code.replace(
  /\{modalState\.item\.variants\.map\(\(v\) => \{\s*const currentVariantName/g,
  `{modalState.item.variants.map((v) => {
                let modalVariantCbm = v.cbm;
                if (modalState.item.name === '옷') modalVariantCbm = materialSettings['대박스(옷)'] || 0;
                if (modalState.item.name === '이불') modalVariantCbm = materialSettings['특대박스(이불)'] || 0;
                if (modalState.item.name === '생활물품/잔짐류(중박스용)') modalVariantCbm = materialSettings['중박스'] || 0;
                if (modalState.item.name === '도서/소형물품(소박스용)') modalVariantCbm = materialSettings['소박스'] || 0;
                if (modalState.item.name === '기타물품1' || modalState.item.name === '기타물품2') modalVariantCbm = materialSettings[v.name] || 0;

                const currentVariantName`
);

fs.writeFileSync('src/app/(wizard)/step2/page.tsx', code);
console.log('Fixed modal map');
