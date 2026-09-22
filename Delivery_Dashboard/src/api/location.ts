export const fetchProvinces = async () => {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/p/");
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch provinces:", error);
    return [];
  }
};

export const fetchDistricts = async (provinceCode: number | string) => {
  if (!provinceCode) return [];
  try {
    const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = await res.json();
    return data.districts || [];
  } catch (error) {
    console.error("Failed to fetch districts:", error);
    return [];
  }
};

export const fetchWards = async (districtCode: number | string) => {
  if (!districtCode) return [];
  try {
    const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const data = await res.json();
    return data.wards || [];
  } catch (error) {
    console.error("Failed to fetch wards:", error);
    return [];
  }
};
