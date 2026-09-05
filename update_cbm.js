const fs = require('fs');

function roundCBM(val) {
  if (val === 0) return 0;
  if (val > 0 && val < 1) return 0.5;
  return Math.round(val * 2) / 2;
}

let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

// Replace cbm: X.X
code = code.replace(/cbm:\s*([0-9.]+)/g, (match, p1) => {
  const val = parseFloat(p1);
  const rounded = roundCBM(val);
  // keep 1 decimal place if it was fractional, or just standard string formatting
  // Actually, Javascript's toString() is fine, e.g., 1.5, 1, 0.5, 0
  return `cbm: ${rounded}`;
});

// Replace createStandardVariants(X.X, Y.Y, Z.Z)
code = code.replace(/createStandardVariants\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/g, (match, p1, p2, p3) => {
  const v1 = roundCBM(parseFloat(p1));
  const v2 = roundCBM(parseFloat(p2));
  const v3 = roundCBM(parseFloat(p3));
  return `createStandardVariants(${v1}, ${v2}, ${v3})`;
});

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('Updated all CBM values in items.ts');
