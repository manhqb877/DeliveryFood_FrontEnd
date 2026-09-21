const fs = require('fs');
const file = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/api/client.ts';
let text = fs.readFileSync(file, 'utf8');

const methods = `
  addBulkCategoryOption: async (categoryId: number, optionData: any) => {
    try {
      const res = await fetch(\`http://localhost:8080/api/v1/core/items/category/\${categoryId}/bulk-options\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optionData)
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  },
  updateBulkCategoryOption: async (categoryId: number, oldGroupName: string, oldOptionName: string, newOptionData: any) => {
    try {
      const res = await fetch(\`http://localhost:8080/api/v1/core/items/category/\${categoryId}/bulk-options\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_group_name: oldGroupName,
          old_option_name: oldOptionName,
          new_option: newOptionData
        })
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  },
  deleteBulkCategoryOption: async (categoryId: number, groupName: string, optionName: string) => {
    try {
      const res = await fetch(\`http://localhost:8080/api/v1/core/items/category/\${categoryId}/bulk-options?groupName=\${encodeURIComponent(groupName)}&optionName=\${encodeURIComponent(optionName)}\`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  }
};
`;

text = text.replace(/};\s*$/, methods);
fs.writeFileSync(file, text);
