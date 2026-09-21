const fs = require('fs');
const path = require('path');

const filePath = '/Users/thaian/Documents/KLTN_DeliveryFood/Code/DeliveryFood_FrontEnd/Delivery_Dashboard/src/features/shop/menu/MenuItemsPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Pagination state
if (!content.includes('const [currentPage, setCurrentPage] = useState(1);')) {
  content = content.replace(
    /const \[statusFilter, setStatusFilter\] = useState\('ALL'\);/,
    `const [statusFilter, setStatusFilter] = useState('ALL');\n\n  // Pagination\n  const [currentPage, setCurrentPage] = useState(1);\n  const itemsPerPage = 6;`
  );
}

// 2. Add useEffect for filters
if (!content.includes('setCurrentPage(1);')) {
  content = content.replace(
    /useEffect\(\(\) => \{\n    loadData\(\);\n  \}, \[\]\);/,
    `useEffect(() => {\n    loadData();\n  }, []);\n\n  useEffect(() => {\n    setCurrentPage(1);\n  }, [search, categoryFilter, statusFilter]);`
  );
}

// 3. Add handleDeleteItem
if (!content.includes('const handleDeleteItem =')) {
  content = content.replace(
    /const handleDeletePriceRule = async/,
    `const handleDeleteItem = async (id: number) => {\n    if (confirm("Bạn có chắc chắn muốn xoá món ăn này không?")) {\n      await dbService.deleteItem(id);\n      alert("Đã xoá món ăn thành công!");\n      loadData();\n    }\n  };\n\n  const handleDeletePriceRule = async`
  );
}

// 4. Update filteredItems and add paginatedItems
if (!content.includes('const paginatedItems =')) {
  content = content.replace(
    /const filteredItems = items\.filter\(\(i\) => \{[\s\S]*?return matchSearch && matchCat && matchStat;\n  \}\);/,
    `const filteredItems = items.filter((i) => {\n    if (i.status === 'DISCONTINUED') return false;\n    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());\n    const matchCat = categoryFilter === 'ALL' || i.category_id === Number(categoryFilter);\n    const matchStat = statusFilter === 'ALL' || i.status === statusFilter;\n    return matchSearch && matchCat && matchStat;\n  });\n\n  const indexOfLastItem = currentPage * itemsPerPage;\n  const indexOfFirstItem = indexOfLastItem - itemsPerPage;\n  const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);\n  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);`
  );
}

// 5. Replace map and add pagination UI and Trash button
if (!content.includes('paginatedItems.map')) {
  content = content.replace(
    /\{filteredItems\.map\(\(item\) => \(/,
    `{paginatedItems.map((item) => (`
  );
  
  content = content.replace(
    /title: 'Tuỳ chọn\/Topping \(item_options\)',\n\s*onClick: \(\) => handleOpenOptionsModal\(item\),\n\s*\}/g,
    `title: 'Tuỳ chọn/Topping (item_options)',\n                    onClick: () => handleOpenOptionsModal(item),\n                  },\n                  {\n                    icon: <Trash2 className="w-4 h-4 text-rose-600" />,\n                    title: 'Xoá món',\n                    onClick: () => handleDeleteItem(item.id),\n                    danger: true\n                  }`
  );
  
  content = content.replace(
    /<\/div>\n\s*\)\)}/,
    `</div>\n          ))}`
  );

  content = content.replace(
    /\{\/\* Quick status toggle button \(AVAILABLE ⇄ SOLD_OUT\) \*\/\}/,
    `{/* Quick status toggle button (AVAILABLE ⇄ SOLD_OUT) */}`
  );

  content = content.replace(
    /\}\)\}\n\s*<\/div>\n\s*\}\)/,
    `})\}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={\`w-10 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer \${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }\`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done");
