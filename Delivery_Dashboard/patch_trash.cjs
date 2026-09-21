const fs = require('fs');
const filePath = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/features/shop/menu/MenuItemsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('title: \'Xoá món\',')) {
  content = content.replace(
    /title: 'Tuỳ chọn\/Topping \(item_options\)',\n\s*onClick: \(\) => handleOpenOptionsModal\(item\),\n\s*\}/g,
    `title: 'Tuỳ chọn/Topping (item_options)',\n                    onClick: () => handleOpenOptionsModal(item),\n                  },\n                  {\n                    icon: <Trash2 className="w-4 h-4 text-rose-600" />,\n                    title: 'Xoá món',\n                    onClick: () => handleDeleteItem(item.id),\n                    danger: true\n                  }`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done trash button');
