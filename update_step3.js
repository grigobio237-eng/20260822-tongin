const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step3/page.tsx', 'utf8');

code = code.replace(
  "// 생활물품(잔짐류) -> 중박스",
  "// 생활물품/잔짐류(중박스용) -> 중박스"
);
code = code.replace(
  "if (room.items['생활물품(잔짐류)']) {\n        room.items['생활물품(잔짐류)'].forEach(inst => mediumBox += inst.quantity);\n      }",
  "if (room.items['생활물품/잔짐류(중박스용)']) {\n        room.items['생활물품/잔짐류(중박스용)'].forEach(inst => mediumBox += inst.quantity);\n      }\n      // 도서/소형물품(소박스용) -> 소박스\n      if (room.items['도서/소형물품(소박스용)']) {\n        room.items['도서/소형물품(소박스용)'].forEach(inst => smallBox += inst.quantity);\n      }"
);

code = code.replace(
  "sync('중박스', mediumBox);",
  "sync('중박스', mediumBox);\n    sync('소박스', smallBox);"
);

fs.writeFileSync('src/app/(wizard)/step3/page.tsx', code);
console.log('done');
