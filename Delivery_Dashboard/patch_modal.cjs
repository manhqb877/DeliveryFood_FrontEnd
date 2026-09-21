const fs = require('fs');
const filePath = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/features/shop/menu/MenuItemsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove name_en
if (content.includes('Tên món (English name):')) {
  content = content.replace(
    /<div>\n\s*<label className="block font-medium text-slate-700 mb-1">Tên món \(English name\):<\/label>\n\s*<input\n\s*type="text"\n\s*value=\{editingItem\.name_en \|\| ''\}\n\s*onChange=\{\(e\) => setEditingItem\(\(prev\) => \(\{ \.\.\.prev, name_en: e\.target\.value \}\)\)\}\n\s*placeholder="VD: Broken Rice with Grilled Pork Chop"\n\s*className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-white"\n\s*\/>\n\s*<\/div>/,
    ''
  );
  content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-3">\n\s*<div>\n\s*<label className="block font-medium text-slate-700 mb-1">Tên món ăn \(Tiếng Việt\)/, '<div className="grid grid-cols-1 md:grid-cols-2 gap-3">\n              <div className="md:col-span-2">\n                <label className="block font-medium text-slate-700 mb-1">Tên món ăn (Tiếng Việt)');
}

// Add discount_price
if (!content.includes('Giá sau giảm')) {
  content = content.replace(
    /<div>\n\s*<label className="block font-medium text-slate-700 mb-1">Trạng thái món:<\/label>/,
    `<div>\n                <label className="block font-medium text-slate-700 mb-1">Giá sau giảm (discount_price ₫):</label>\n                <input\n                  type="number"\n                  step="1000"\n                  value={editingItem.discount_price || ''}\n                  onChange={(e) => setEditingItem((prev) => ({ ...prev, discount_price: Number(e.target.value) }))}\n                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-rose-600 font-bold"\n                />\n              </div>\n              <div>\n                <label className="block font-medium text-slate-700 mb-1">Trạng thái món:</label>`
  );
  content = content.replace(
    /<div className="grid grid-cols-1 md:grid-cols-2 gap-3">\n\s*<div>\n\s*<label className="block font-medium text-slate-700 mb-1">Danh mục thực đơn:<\/label>/,
    `<div className="grid grid-cols-1 md:grid-cols-3 gap-3">\n              <div>\n                <label className="block font-medium text-slate-700 mb-1">Danh mục thực đơn:</label>`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done modal fields');
