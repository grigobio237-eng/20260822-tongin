const fs = require('fs');

// 1. items.ts
let items = fs.readFileSync('src/lib/constants/items.ts', 'utf8');
items = items.replace(
  "export type RoomCategory = '规 1' | '规 2' | '规 3' | '规 4' | '规 5' | '芭角' | '林规' | '海鄂促';",
  "export type RoomCategory = '救规' | '涝备规' | '累篮规1' | '累篮规2' | '累篮规3' | '芭角' | '林规' | '海鄂促';"
);
items = items.replace(
  "'规 1': ROOM_ITEMS,\n  '规 2': ROOM_ITEMS,\n  '规 3': ROOM_ITEMS,\n  '规 4': ROOM_ITEMS,\n  '规 5': ROOM_ITEMS,",
  "'救规': ROOM_ITEMS,\n  '涝备规': ROOM_ITEMS,\n  '累篮规1': ROOM_ITEMS,\n  '累篮规2': ROOM_ITEMS,\n  '累篮规3': ROOM_ITEMS,"
);
fs.writeFileSync('src/lib/constants/items.ts', items);

// 2. step2/page.tsx
let step2 = fs.readFileSync('src/app/(wizard)/step2/page.tsx', 'utf8');
step2 = step2.replace(
  "const [activeTab, setActiveTab] = useState<RoomCategory>('规 1');",
  "const [activeTab, setActiveTab] = useState<RoomCategory>('救规');"
);
fs.writeFileSync('src/app/(wizard)/step2/page.tsx', step2);

// 3. wizardStore.ts
let store = fs.readFileSync('src/store/wizardStore.ts', 'utf8');
store = store.replace(/ROOM_CATEGORIES\['规 1'\]/g, "ROOM_CATEGORIES['救规']");
fs.writeFileSync('src/store/wizardStore.ts', store);

console.log('done');
