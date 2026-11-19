const PROVINCE_NAME_BY_CODE = {
  "AR-B": "Buenos Aires",
  "AR-C": "Ciudad Autónoma de Buenos Aires",
  "AR-K": "Catamarca",
  "AR-H": "Chaco",
  "AR-U": "Chubut",
  "AR-X": "Córdoba",
  "AR-W": "Corrientes",
  "AR-E": "Entre Ríos",
  "AR-P": "Formosa",
  "AR-Y": "Jujuy",
  "AR-L": "La Pampa",
  "AR-F": "La Rioja",
  "AR-M": "Mendoza",
  "AR-N": "Misiones",
  "AR-Q": "Neuquén",
  "AR-R": "Río Negro",
  "AR-A": "Salta",
  "AR-J": "San Juan",
  "AR-D": "San Luis",
  "AR-Z": "Santa Cruz",
  "AR-S": "Santa Fe",
  "AR-G": "Santiago del Estero",
  "AR-V": "Tierra del Fuego",
  "AR-T": "Tucumán",
};

const INDEC_CODE_TO_PROVINCE_CODE = {
  "00": "AR-C",
  "01": "AR-C",
  "02": "AR-C",
  "06": "AR-B",
  "10": "AR-K",
  "14": "AR-X",
  "18": "AR-W",
  "22": "AR-H",
  "26": "AR-U",
  "30": "AR-E",
  "34": "AR-P",
  "38": "AR-Y",
  "42": "AR-L",
  "46": "AR-F",
  "50": "AR-M",
  "54": "AR-N",
  "58": "AR-Q",
  "62": "AR-R",
  "66": "AR-A",
  "70": "AR-J",
  "74": "AR-D",
  "78": "AR-Z",
  "82": "AR-S",
  "86": "AR-G",
  "90": "AR-T",
  "94": "AR-V",
  "2": "AR-C",
  "6": "AR-B",
};

function normalizeStr(text) {
  if (!text) return "";
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Convierte un código de provincia (ej. AR-S), objeto o nombre a un ID de distrito válido.
 */
export function mapProvinceCodeToDistrictId(val, districtsList) {
  if (!val) return "";
  let str = "";
  if (typeof val === "object" && val !== null) {
    if (val.id != null) str = String(val.id).trim();
    else if (val.province != null) str = String(val.province).trim();
    else if (val.district != null) str = String(val.district).trim();
    else if (val.name != null) str = String(val.name).trim();
    else return "";
  } else {
    str = String(val).trim();
  }

  if (!str || str === "N/A" || str === "—" || str === "[object Object]") return "";

  if (INDEC_CODE_TO_PROVINCE_CODE[str]) {
    str = INDEC_CODE_TO_PROVINCE_CODE[str];
  }

  const cleanUpper = str.toUpperCase();

  if (Array.isArray(districtsList) && districtsList.length > 0) {
    // 1. Coincidencia exacta por ID
    const byId = districtsList.find(
      (d) => String(d.id).trim().toUpperCase() === cleanUpper
    );
    if (byId) return String(byId.id).trim();

    // 2. Coincidencia vía PROVINCE_NAME_BY_CODE
    const targetName = PROVINCE_NAME_BY_CODE[cleanUpper] || PROVINCE_NAME_BY_CODE[str];
    if (targetName) {
      const normTarget = normalizeStr(targetName);
      const match = districtsList.find((d) => {
        const normD = normalizeStr(d.name);
        return (
          normD === normTarget ||
          normD.includes(normTarget) ||
          normTarget.includes(normD)
        );
      });
      if (match) return String(match.id).trim();
    }

    // 3. Coincidencia directa por nombre normalizado
    const normStr = normalizeStr(str);
    const byName = districtsList.find((d) => {
      const normD = normalizeStr(d.name);
      return (
        normD === normStr ||
        normD.includes(normStr) ||
        normStr.includes(normD)
      );
    });
    if (byName) return String(byName.id).trim();
  }

  // 4. Reverse lookup en catálogo estático
  const normStr = normalizeStr(str);
  for (const [code, name] of Object.entries(PROVINCE_NAME_BY_CODE)) {
    const normName = normalizeStr(name);
    if (normName === normStr || normName.includes(normStr) || normStr.includes(normName)) {
      return code;
    }
  }

  return cleanUpper.startsWith("AR-") ? cleanUpper : str;
}

/**
 * Obtiene el nombre para mostrar de un distrito/provincia.
 */
export function getDistrictDisplay(district, districtsList) {
  if (district == null || district === "" || district === "N/A" || district === "—") return "—";
  if (typeof district === "object" && district !== null) {
    if (district.name != null && district.name !== "") return String(district.name).trim();
    if (district.id != null) district = district.id;
    else if (district.province != null) district = district.province;
    else if (district.district != null) district = district.district;
    else return "—";
  }

  const cleanId = String(district).trim();
  if (!cleanId || cleanId === "—" || cleanId === "N/A" || cleanId === "[object Object]") return "—";

  const provCode = INDEC_CODE_TO_PROVINCE_CODE[cleanId] || cleanId.toUpperCase();
  if (PROVINCE_NAME_BY_CODE[provCode]) {
    return PROVINCE_NAME_BY_CODE[provCode];
  }
  if (PROVINCE_NAME_BY_CODE[cleanId]) {
    return PROVINCE_NAME_BY_CODE[cleanId];
  }

  if (Array.isArray(districtsList) && districtsList.length > 0) {
    const found = districtsList.find((d) => String(d.id).trim() === cleanId);
    if (found && found.name != null) return found.name;

    const mapped = mapProvinceCodeToDistrictId(cleanId, districtsList);
    if (mapped) {
      const foundMapped = districtsList.find(
        (d) => String(d.id).trim() === String(mapped).trim()
      );
      if (foundMapped && foundMapped.name != null) return foundMapped.name;
    }
  }

  return cleanId;
}

export function getBillingProvinceDisplay(province, districtsList) {
  return getDistrictDisplay(province, districtsList);
}
