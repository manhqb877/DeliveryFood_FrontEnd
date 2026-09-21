const fs = require('fs');
const filePath = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/features/shop/menu/MenuItemsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('const handleCategoryChange = async')) {
  content = content.replace(
    /const handleEditItem = async/,
    `const handleCategoryChange = async (categoryId: number) => {\n    setEditingItem((prev) => ({ ...prev, category_id: categoryId }));\n    const suggested = await (dbService as any).getSuggestedOptionsByCategory?.(categoryId) || [];\n    setSuggestedOptions(suggested);\n  };\n\n  const handleEditItem = async`
  );
  content = content.replace(
    /onChange=\{\(e\) => setEditingItem\(\(prev\) => \(\{ \.\.\.prev, category_id: Number\(e\.target\.value\) \}\)\)\}/,
    `onChange={(e) => handleCategoryChange(Number(e.target.value))}`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done category change handler');
