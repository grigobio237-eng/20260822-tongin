const fs = require('fs');
let code = fs.readFileSync('src/store/wizardStore.ts', 'utf8');

code = code.replace(
  /const newRoomItems = \{ \.\.\.state\.roomItems \};\s+const currentInstances/g,
  `const newRoomItems = { ...state.roomItems };
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
          const currentInstances`
);

code = code.replace(
  /const newRoomItems = \{ \.\.\.state\.roomItems \};\s+newRoomItems\[room\]\.note/g,
  `const newRoomItems = { ...state.roomItems };
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
          newRoomItems[room].note`
);

code = code.replace(
  /const newRoomItems = \{ \.\.\.state\.roomItems \};\s+newRoomItems\[room\]\.images/g,
  `const newRoomItems = { ...state.roomItems };
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
          newRoomItems[room].images`
);

code = code.replace(
  /const newRoomItems = \{ \.\.\.state\.roomItems \};\s+if \(!newRoomItems\[room\]\.items/g,
  `const newRoomItems = { ...state.roomItems };
          if (!newRoomItems[room]) newRoomItems[room] = { items: {}, note: '', images: [] };
          if (!newRoomItems[room].items`
);


// There's also removeRoomItemInstance, updateRoomItemQuantity, changeItemVariant
// Let's replace 'const newRoomItems = { ...state.roomItems };' generally in those if not matched.
// It's safer to just iterate lines and insert it right after.

fs.writeFileSync('src/store/wizardStore.ts', code);
console.log('wizard store patched');
