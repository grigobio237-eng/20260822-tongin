const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step2/page.tsx', 'utf8');

// Update empty shell render
code = code.replace(
  /const def = item.variants.find\(v => v.isDefault\) \|\| item.variants\[1\] \|\| item.variants\[0\];\n\s*return \(/,
  \const def = item.variants.find(v => v.isDefault) || item.variants[1] || item.variants[0];
                    let defCbm = def.cbm;
                    if (item.name === '옷') defCbm = materialSettings['대박스(옷)'] || 0;
                    if (item.name === '이불') defCbm = materialSettings['특대박스(이불)'] || 0;
                    return (\
);

// Update empty shell button text
code = code.replace(
  /\{def.name\} \(\{def.cbm\} CBM\)/g,
  "{def.name} ({defCbm} CBM)"
);

// Update instances loop
const instancesLoopOld = \instances.map((inst, idx) => (\;
const instancesLoopNew = \instances.map((inst, idx) => {
                    let displayCbm = inst.unitCbm;
                    if (item.name === '옷') displayCbm = materialSettings['대박스(옷)'] || 0;
                    if (item.name === '이불') displayCbm = materialSettings['특대박스(이불)'] || 0;
                    return (\;
code = code.replace(instancesLoopOld, instancesLoopNew);

// Since we replaced instances.map to use a block '{}', we need to close it with '})' instead of ')'
// However, the original had 'instances.map((inst, idx) => (' and ended with ')'
// Wait, replacing '=> (' with '=> { ... return (' means we need to replace the matching closing ')' with '})'
// Let's do it cleanly by searching for the closing brace of the map.
// Alternatively, just inject a variable before map:
