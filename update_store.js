const fs = require('fs');
let code = fs.readFileSync('src/store/settingsStore.ts', 'utf8');

if (!code.includes('materialCbmSettings:')) {
  // Add to SettingsState
  code = code.replace(/optionPrices: Record<string, number>;/, "optionPrices: Record<string, number>;\n  materialCbmSettings: Record<string, number>;");

  // Add to defaultValues
  const defaultValuesStr = \const defaultValues: Omit<SettingsState, 'isLoading' | 'fetchSettings' | 'updateSettings'> = {\;
  code = code.replace(defaultValuesStr, defaultValuesStr + "\n  materialCbmSettings: {\n    '특대박스(이불)': 0,\n    '대박스(옷)': 0,\n    '중대박스': 0,\n    '중박스': 0,\n    '소박스': 0,\n    '바구니': 0,\n    '아이스박스': 0\n  },");

  // Add to fetchSettings
  code = code.replace(/optionPrices: data\.optionPrices \|\| get\(\)\.optionPrices,/, "optionPrices: data.optionPrices || get().optionPrices,\n              materialCbmSettings: data.materialCbmSettings || get().materialCbmSettings,");

  fs.writeFileSync('src/store/settingsStore.ts', code);
  console.log('Store updated');
} else {
  console.log('Already updated');
}
