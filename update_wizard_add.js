const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

const injection = \          if (itemName === '옷' || itemName === '이불') {
            const { useSettingsStore } = require('./settingsStore');
            const materialSettings = useSettingsStore.getState().materialCbmSettings;
            if (itemName === '옷') defaultUnitCbm = materialSettings['대박스(옷)'] || 0;
            if (itemName === '이불') defaultUnitCbm = materialSettings['특대박스(이불)'] || 0;
          }

          const newInstance: RoomItemInstance = {\;

code = code.replace(/          const newInstance: RoomItemInstance = \{/, injection);

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('done');
