const fs = require('fs');
let code = fs.readFileSync('src/app/(wizard)/step2/page.tsx', 'utf8');

const target = `      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide">
        {(Object.keys(ROOM_CATEGORIES) as RoomCategory[]).map((room) => (
          <button
            key={room}
            onClick={() => setActiveTab(room)}
            className={clsx(
              "px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors snap-start border",
              activeTab === room 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {room}
          </button>
        ))}
      </div>

      {/* Items Grid Header */}
      <div className="sticky top-0 bg-white z-10 py-3 mb-4 flex justify-between items-center px-1 border-b">
        <h3 className="font-bold text-gray-800">{activeTab} 물품 목록</h3>
        <div className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
          소계:`;

const replace = `      {/* Sticky Container for Tabs and Header */}
      <div className="sticky top-[73px] md:top-[77px] z-40 bg-gray-50 pt-2 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 before:absolute before:inset-0 before:bg-gray-50 before:-z-10 before:shadow-sm">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-3 gap-2 snap-x scrollbar-hide">
          {(Object.keys(ROOM_CATEGORIES) as RoomCategory[]).map((room) => (
            <button
              key={room}
              onClick={() => setActiveTab(room)}
              className={clsx(
                "px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors snap-start border",
                activeTab === room 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {room}
            </button>
          ))}
        </div>

        {/* Items Grid Header */}
        <div className="bg-white py-3 flex justify-between items-center px-4 border rounded-lg shadow-sm mt-2">
          <h3 className="font-bold text-gray-800">{activeTab} 물품 목록</h3>
          <div className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            소계:`;

code = code.replace(target, replace);
fs.writeFileSync('src/app/(wizard)/step2/page.tsx', code);
console.log('step2 sticky patched');
