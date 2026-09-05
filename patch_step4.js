const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step4/page.tsx', 'utf8');

code = code.replace(/data\.items \|\| \{\}/g, 'data?.items || {}');
code = code.replace(/data\.note \|\| ''/g, 'data?.note || \'\'');
code = code.replace(/data\.images \|\| \[\]/g, 'data?.images || []');

fs.writeFileSync('src/app/(wizard)/step4/page.tsx', code);
console.log('step4 patched');
