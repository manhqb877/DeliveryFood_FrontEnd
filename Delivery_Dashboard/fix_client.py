import re

with open("src/api/client.ts", "r") as f:
    content = f.read()

# Fix getShops fallback
content = re.sub(
    r'    return getStored<ShopProfile\[\]>\(STORAGE_KEYS\.SHOPS, initialShops\);\n  },',
    r'    return [];\n  },',
    content
)

# Fix getOrders fallback
content = re.sub(
    r'      console\.warn\(\'Using local orders fallback\'\);\n    }\n    return getStored<Order\[\]>\(STORAGE_KEYS\.ORDERS, initialOrders\);\n  },',
    r'      console.warn(\'Orders fallback removed\');\n    }\n    return [];\n  },',
    content
)

# Fix getPromotions fallback
content = re.sub(
    r'      console\.warn\(\'Backend server unreachable for promotions, using local storage\'\);\n    }\n    const list = getStored<Promotion\[\]>\(STORAGE_KEYS\.PROMOTIONS, initialPromotions\);\n    if \(type === \'SHOP\'\) return list\.filter\(p => p\.type === \'SHOP\'\);\n    if \(type === \'PLATFORM\'\) return list\.filter\(p => p\.type === \'PLATFORM\'\);\n    return list;\n  },',
    r'      console.warn(\'Promotions fallback removed\');\n    }\n    return [];\n  },',
    content
)

# Fix getCommissionConfigs fallback
content = re.sub(
    r'  getCommissionConfigs: async \(\) => getStored<CommissionConfig\[\]>\(STORAGE_KEYS\.COMMISSIONS, initialCommissionConfigs\),',
    r'''  getCommissionConfigs: async () => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      const res = await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/commission-configs/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch(e) {}
    return [];
  },''',
    content
)

# Fix approveShop to use API
content = re.sub(
    r'''  approveShop: async \(shopId: number, approved: boolean, reason\?: string\) => \{
    const shops = getStored<ShopProfile\[\]>\(STORAGE_KEYS\.SHOPS, initialShops\);
    const users = getStored<User\[\]>\(STORAGE_KEYS\.USERS, initialUsers\);
    let targetOwnerId: number \| undefined;

    const updatedShops = shops\.map\(s => \{
      if \(s\.id === shopId\) \{
        targetOwnerId = s\.owner_id;
        return \{
          \.\.\.s,
          approval_status: approved \? 'APPROVED' : 'REJECTED'
        \} as ShopProfile;
      \}
      return s;
    \}\);
    setStored\(STORAGE_KEYS\.SHOPS, updatedShops\);

    if \(targetOwnerId\) \{
      const updatedUsers = users\.map\(u => \{
        if \(u\.id === targetOwnerId\) \{
          return \{ \.\.\.u, status: approved \? 'ACTIVE' : 'LOCKED' \} as User;
        \}
        return u;
      \}\);
      setStored\(STORAGE_KEYS\.USERS, updatedUsers\);
    \}

    return updatedShops;
  \},''',
    r'''  approveShop: async (shopId: number, approved: boolean, reason?: string) => {
    try {
      const token = localStorage.getItem('hyperlocal_access_token') || localStorage.getItem('auth_token');
      await fetch(`http://${import.meta.env.VITE_API_IP || '192.168.100.151'}:8080/api/v1/auth/shops/${shopId}/status?status=${approved ? 'APPROVED' : 'REJECTED'}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch(e) {}
    return dbService.getShops();
  },''',
    content
)

with open("src/api/client.ts", "w") as f:
    f.write(content)

print("Replaced!")
