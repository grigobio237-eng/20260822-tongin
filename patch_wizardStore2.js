const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

// I'll just use a regex to find all instances of 'const newRoomItems = { ...state.roomItems };' inside functions taking 'room' parameter.
// The easiest way is:
const fix = `const newRoomItems = { ...state.roomItems };
          if (room && !newRoomItems[room]) {
            newRoomItems[room] = { items: {}, note: '', images: [] };
          }`;
code = code.split('const newRoomItems = { ...state.roomItems };').join(fix);

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('done');
