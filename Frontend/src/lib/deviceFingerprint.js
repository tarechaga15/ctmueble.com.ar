/**
 * Utilidad de fingerprinting de dispositivo para la Oficina Virtual del CTM.
 * Combina atributos estables del entorno de navegación y genera un identificador
 * criptográfico (SHA-256) sin requerir permisos intrusivos.
 */

async function sha256(str) {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // Fallback simple si Web Crypto no estuviera disponible
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, "0");
  }

  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getOrCreateDeviceId() {
  if (typeof window === "undefined" || !window.localStorage) {
    return "dev-" + Math.random().toString(36).substring(2, 15);
  }

  const KEY = "ctm_device_id";
  let deviceId = localStorage.getItem(KEY);
  if (!deviceId) {
    const randomSuffix = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : (Date.now().toString(36) + Math.random().toString(36).substring(2));
    deviceId = "dev-" + randomSuffix;
    localStorage.setItem(KEY, deviceId);
  }
  return deviceId;
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = "#1b080a";
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = "#c72a33";
    ctx.fillText("CTM Oficina Virtual 2FA", 15, 18);
    return canvas.toDataURL().slice(-50);
  } catch {
    return "canvas-err";
  }
}

export async function getDeviceFingerprint() {
  if (typeof window === "undefined") {
    return { deviceId: "server-device", deviceFingerprint: "server-fp" };
  }

  const deviceId = getOrCreateDeviceId();

  const components = [
    navigator.userAgent || "",
    navigator.language || "",
    (navigator.languages || []).join(","),
    navigator.platform || "",
    navigator.hardwareConcurrency || 0,
    window.screen?.width || 0,
    window.screen?.height || 0,
    window.screen?.colorDepth || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    getCanvasFingerprint()
  ];

  const rawString = components.join("||");
  const deviceFingerprint = await sha256(rawString);

  return {
    deviceId,
    deviceFingerprint
  };
}
