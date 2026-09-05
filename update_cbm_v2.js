const fs = require('fs');

function customRound(val) {
  if (val === 0) return 0;
  
  let intPart = Math.floor(val);
  let fracPart = val - intPart;
  
  // Fix floating point issues (e.g. 0.300000000004 -> 0.3)
  fracPart = Math.round(fracPart * 10) / 10;
  
  if (intPart === 0) {
    if (fracPart > 0 && fracPart <= 0.6) return 0.5;
    if (fracPart >= 0.7) return 1.0;
  } else {
    if (fracPart >= 0.0 && fracPart <= 0.2) return intPart + 0.0;
    if (fracPart >= 0.3 && fracPart <= 0.6) return intPart + 0.5;
    if (fracPart >= 0.7) return intPart + 1.0;
  }
  
  return val; // fallback
}

let code = fs.readFileSync('src/lib/constants/items.ts', 'utf8');

// Replace cbm: X.X
code = code.replace(/cbm:\s*([0-9.]+)/g, (match, p1) => {
  const val = parseFloat(p1);
  const rounded = customRound(val);
  return `cbm: ${rounded}`;
});

// Replace createStandardVariants(X.X, Y.Y, Z.Z)
code = code.replace(/createStandardVariants\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/g, (match, p1, p2, p3) => {
  const v1 = customRound(parseFloat(p1));
  const v2 = customRound(parseFloat(p2));
  const v3 = customRound(parseFloat(p3));
  return `createStandardVariants(${v1}, ${v2}, ${v3})`;
});

fs.writeFileSync('src/lib/constants/items.ts', code);
console.log('Updated all CBM values with new rounding rules');
