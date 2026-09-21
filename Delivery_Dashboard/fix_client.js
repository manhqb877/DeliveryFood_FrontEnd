const fs = require('fs');
const filePath = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/api/client.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /return Array\.isArray\(data\) \? data : \(data\?\.data && Array\.isArray\(data\.data\) \? data\.data : \[\]\);/,
  `return data;`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done fixing client.ts return');
