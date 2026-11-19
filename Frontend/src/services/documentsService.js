import api from "./axios";

/** Códigos de tipo de documento para descarga por ensayo */
export const DOCUMENT_TYPE_CODES = {
  /** Informe de ensayo (resultado final) */
  REPORT: "F-PC15-01",
  /** Orden de trabajo / recepción de muestras */
  WORK_ORDER_RECEPTION: "F-PC16-01",
};

/**
 * Obtiene el nombre de archivo del header Content-Disposition o un valor por defecto.
 * @param {import('axios').AxiosResponse} response
 * @param {string} defaultName
 * @returns {string}
 */
function getFilenameFromResponse(response, defaultName = "documento.pdf") {
  const disposition = response.headers?.["content-disposition"];
  if (!disposition) return defaultName;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) || disposition.match(/filename="?([^";\n]+)"?/i);
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : defaultName;
}

/**
 * Fuerza la descarga de un Blob en el navegador (misma pestaña, sin abrir ventana nueva).
 * @param {Blob} blob
 * @param {string} filename
 */
function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "documento.pdf";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
}

export const documentsService = {
  /**
   * Descarga un documento por su ID usando Axios con cookies HttpOnly/CSRF y respuesta Blob.
   * Elimina cualquier uso inseguro de token en URL (?access_token=).
   * @param {string|number} documentId - ID del documento a descargar
   * @param {string} [suggestedFilename] - Nombre sugerido si el servidor no envía Content-Disposition
   * @param {() => void} [onDownloadStarted] - Se llama cuando la descarga comenzó (ej. para mostrar un toast)
   * @returns {Promise<void>}
   */
  download: async (documentId, suggestedFilename = "documento.pdf", onDownloadStarted) => {
    const response = await api.get("/essays/download-document", {
      params: { id: documentId },
      responseType: "blob",
    });
    const contentType = response.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      const text = await response.data.text();
      const err = JSON.parse(text);
      throw new Error(err.error || err.message || "Error al descargar");
    }
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    const filename = getFilenameFromResponse(response, suggestedFilename);
    triggerBlobDownload(blob, filename);
    onDownloadStarted?.();
  },

  /**
   * Descarga el documento de un ensayo por tipo en la misma ventana mediante Blob.
   * @param {string} essayId - ID del ensayo
   * @param {string} typeCode - Código del tipo (ej: DOCUMENT_TYPE_CODES.REPORT, DOCUMENT_TYPE_CODES.WORK_ORDER_RECEPTION)
   * @param {string|(() => void)} [suggestedFilenameOrOnStarted] - Nombre sugerido o callback
   * @param {() => void} [onDownloadStarted] - Se llama cuando la descarga comenzó
   * @returns {Promise<void>}
   */
  downloadByEssayAndType: async (essayId, typeCode, suggestedFilenameOrOnStarted, onDownloadStarted) => {
    const isCallback = typeof suggestedFilenameOrOnStarted === "function";
    const suggestedFilename = isCallback ? undefined : suggestedFilenameOrOnStarted;
    const onStarted = isCallback ? suggestedFilenameOrOnStarted : onDownloadStarted;
    const defaultFilename = suggestedFilename ?? `${typeCode}_${essayId}.pdf`;
    const response = await api.get("/essays/download-document-by-type", {
      params: { essayId, type: typeCode },
      responseType: "blob",
    });
    const contentType = response.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      const text = await response.data.text();
      const err = JSON.parse(text);
      throw new Error(err.error || err.message || "Error al descargar");
    }
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    const filename = getFilenameFromResponse(response, defaultFilename);
    triggerBlobDownload(blob, filename);
    onStarted?.();
  },

  /**
   * Genera URL de descarga directa sin token en query string (aprovecha cookies SameSite=Lax / None).
   * Se recomienda siempre documentsService.download() para máxima compatibilidad cross-site.
   * @param {string|number} documentId
   * @returns {string}
   */
  getDownloadUrl: (documentId) => {
    const baseURL = api.defaults.baseURL || "https://gestion.ctmueble.com.ar";
    return `${baseURL}/essays/download-document?id=${encodeURIComponent(documentId)}`;
  },

  /**
   * Genera URL de descarga por tipo sin token en query string.
   * @param {string} essayId
   * @param {string} typeCode
   * @returns {string}
   */
  getDownloadByTypeUrl: (essayId, typeCode) => {
    const baseURL = api.defaults.baseURL || "https://gestion.ctmueble.com.ar";
    return `${baseURL}/essays/download-document-by-type?essayId=${encodeURIComponent(essayId)}&type=${encodeURIComponent(typeCode)}`;
  },
};
