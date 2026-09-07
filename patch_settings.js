const fs = require('fs');
let code = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

// Update imports
code = code.replace(
  /import \{ OPTION_ITEMS, PACKING_MATERIALS \} from '@\/lib\/constants\/items';/,
  `import { OPTION_ITEMS, PACKING_MATERIALS, ROOM_ITEMS, LIVING_ROOM_ITEMS, KITCHEN_ITEMS, VERANDA_ITEMS, REAR_BALCONY_ITEMS, UTILITY_ROOM_ITEMS } from '@/lib/constants/items';`
);

// Extract all items for DB tab
const allItemsCode = `
// 모든 가전/가구 리스트 병합 (중복 제거)
const allMasterItems = [
  ...ROOM_ITEMS,
  ...LIVING_ROOM_ITEMS,
  ...KITCHEN_ITEMS,
  ...VERANDA_ITEMS,
  ...REAR_BALCONY_ITEMS,
  ...UTILITY_ROOM_ITEMS
].filter((item, index, self) => 
  index === self.findIndex((t) => t.name === item.name)
).filter(item => !['옷', '이불', '생활물품/잔짐류(중박스용)', '도서/소형물품(소박스용)', '기타물품1', '기타물품2'].includes(item.name));
`;

// Insert allItemsCode after imports
code = code.replace(/(import .* from '.*';\n)+/, match => match + '\n' + allItemsCode + '\n');

// Add states
code = code.replace(
  /const \[localPartnerContacts, setLocalPartnerContacts\] = useState\(store\.partnerContacts \|\| \{\n    cleaning: \{ companyName: '', phone: '', memo: '' \},\n    organizing: \{ companyName: '', phone: '', memo: '' \},\n  \}\);/,
  `const [localPartnerContacts, setLocalPartnerContacts] = useState(store.partnerContacts || {
    cleaning: { companyName: '', phone: '', memo: '' },
    organizing: { companyName: '', phone: '', memo: '' },
  });
  
  const [activeTab, setActiveTab] = useState<'general' | 'db'>('general');
  const [localItemCbm, setLocalItemCbm] = useState(store.itemCbmSettings || {});
  
  const handleItemCbmChange = (itemName: string, variantName: string, value: string) => {
    const key = \`\${itemName}|\${variantName}\`;
    setLocalItemCbm(prev => {
      const updated = { ...prev };
      if (value === '') {
        delete updated[key];
      } else {
        updated[key] = parseFloat(value);
      }
      return updated;
    });
  };`
);

// Update save payload
code = code.replace(
  /partnerContacts: localPartnerContacts,/,
  `partnerContacts: localPartnerContacts,
      itemCbmSettings: localItemCbm,`
);

// Update JSX structure
const tabMenuHtml = `
      {/* 탭 메뉴 */}
      <div className="flex border-b mb-6">
        <button
          className={\`px-6 py-3 font-bold \${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}\`}
          onClick={() => setActiveTab('general')}
        >
          기본 환경 설정
        </button>
        <button
          className={\`px-6 py-3 font-bold \${activeTab === 'db' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}\`}
          onClick={() => setActiveTab('db')}
        >
          가전/가구 CBM DB 설정
        </button>
      </div>
`;

code = code.replace(
  /<div className="bg-white rounded-2xl shadow-sm border p-6 space-y-8 mt-6">/,
  `<div className="bg-white rounded-2xl shadow-sm border p-6 space-y-8 mt-6">
${tabMenuHtml}
      {activeTab === 'general' && (
        <div className="space-y-8">`
);

// Add DB Tab UI
const dbTabHtml = `
        </div>
      )}

      {activeTab === 'db' && (
        <div className="space-y-8">
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
            <strong>가전/가구 CBM (체적) 설정</strong><br/>
            프로그램에 하드코딩된 기본 권장 CBM을 덮어씁니다. 빈칸으로 두면 원래의 기본 권장 수치가 적용됩니다.
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {allMasterItems.map(item => (
              <div key={item.name} className="border rounded-xl p-4 bg-gray-50">
                <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">{item.name}</h4>
                <div className="space-y-2">
                  {item.variants.map(v => {
                    const key = \`\${item.name}|\${v.name}\`;
                    const customVal = localItemCbm[key];
                    return (
                      <div key={v.name} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex-1">{v.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-16 text-right">기본: {v.cbm}</span>
                          <input
                            type="number"
                            step="0.1"
                            placeholder={v.cbm.toString()}
                            value={customVal !== undefined ? customVal : ''}
                            onChange={(e) => handleItemCbmChange(item.name, v.name, e.target.value)}
                            className="border rounded px-2 py-1 w-20 text-right focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          <span className="text-gray-500 w-8">CBM</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
`;

code = code.replace(
  /      <\/div>\s*<div className="fixed bottom-0/,
  `${dbTabHtml}
      </div>
      <div className="fixed bottom-0`
);

fs.writeFileSync('src/app/settings/page.tsx', code);
console.log('settings page patched');
