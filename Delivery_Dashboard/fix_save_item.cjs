const fs = require('fs');
const filePath = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/api/client.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix API return
content = content.replace(
  /return Array\.isArray\(data\) \? data : \(data\?\.data && Array\.isArray\(data\.data\) \? data\.data : \[\]\);/,
  `return data;`
);

// Fix fallback return
content = content.replace(
  /updated = \[\.\.\.items, newItem\];\n    \}\n    setStored\(STORAGE_KEYS\.ITEMS, updated\);\n    return updated;/,
  `updated = [...items, newItem];\n    }\n    setStored(STORAGE_KEYS.ITEMS, updated);\n    return item.id ? updated.find(i => i.id === item.id) : updated[updated.length - 1];`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done fix_save_item');
