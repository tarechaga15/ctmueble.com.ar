# Guía de Integración Frontend React (`oficina.ctmueble.com.ar`) — Cookies `HttpOnly`, CSRF y CSP

Esta guía detalla los ajustes requeridos en la SPA React (`https://oficina.ctmueble.com.ar`) para consumir el backend (`https://gestion.ctmueble.com.ar`) bajo el esquema endurecido de sesiones en producción, manteniendo retrocompatibilidad con `Authorization: Bearer` en entorno local (`NODE_ENV=development`).

---

## 1. Resumen del Modelo Dual de Sesiones

| Característica | Producción (`NODE_ENV=production`) | Desarrollo (`NODE_ENV=development`) |
|---|---|---|
| Transporte del Access Token | Cookie `ctm_at` (`HttpOnly; Secure; Path=/; Max-Age=900`) | Cookie `ctm_at` **y** `Authorization: Bearer` aceptado |
| Transporte del Refresh Token | Cookie `ctm_rt` (`HttpOnly; Secure; Path=/auth; Max-Age=604800`) | Cookie `ctm_rt` **y** `refresh_token` en JSON / body |
| Tokens crudos en JSON (`/auth/login`, `/auth/refresh_token`) | **Omitidos** (solo `user` y `csrf_token`) | Incluidos (`access_token`, `refresh_token`, `csrf_token`) |
| Protección CSRF en `POST` / `PUT` / `DELETE` | Obligatoria (`ctm_csrf` cookie == `X-CSRF-Token` header + `Origin`) | Exigida solo si autentica por cookie; omitida con `Authorization: Bearer` |
| Query param `?access_token=` | **Eliminado** en todos los entornos | **Eliminado** en todos los entornos |

---

## 2. Variables de Entorno Recomendadas en el Backend (Vercel)

Configurar en el panel de **Vercel -> Settings -> Environment Variables** de `gestion.ctmueble.com.ar`:

```env
NODE_ENV=production
JWT_ACCESS_SECRET=<secreto-aleatorio-64-hex-distinto-1>
JWT_REFRESH_SECRET=<secreto-aleatorio-64-hex-distinto-2>
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=.ctmueble.com.ar
CORS_ORIGINS=https://oficina.ctmueble.com.ar
```

> **Nota sobre Previews en Vercel (`*.vercel.app`):** Si un preview del frontend (`https://oficina-preview.vercel.app`) consume un backend en otro dominio público (`*.vercel.app`), configurar `COOKIE_SAME_SITE=none` (sin `COOKIE_DOMAIN`) en el entorno `Preview` de Vercel y listar el origen del preview en `CORS_ORIGINS`.

---

## 3. Cliente HTTP en React (Axios / Fetch)

### 3.1. Eliminar almacenamiento de tokens en `localStorage` / `sessionStorage`

Eliminar cualquier lectura o escritura de `localStorage.getItem('access_token')` o `localStorage.getItem('refresh_token')`. El navegador enviará automáticamente `ctm_at` y `ctm_rt` cuando se incluya `credentials: 'include'` (`withCredentials: true` en Axios).

### 3.2. Ejemplo listo para producción con Axios (incluye CSRF + Refresh automático)

```ts
import axios from 'axios';

let inMemoryCsrfToken: string | null = null;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCsrfToken(token?: string | null) {
  if (token) inMemoryCsrfToken = token;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://gestion.ctmueble.com.ar',
  withCredentials: true, // Imprescindible para enviar/recibir ctm_at, ctm_rt y ctm_csrf
});

// Adjuntar X-CSRF-Token en mutaciones
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = inMemoryCsrfToken || readCookie('ctm_csrf');
    if (csrf) {
      config.headers['X-CSRF-Token'] = csrf;
    }
  }
  return config;
});

// Capturar X-CSRF-Token actualizado y renovar sesión ante 401 TOKEN_EXPIRED
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => {
    const headerCsrf = response.headers['x-csrf-token'];
    const bodyCsrf = response.data?.csrf_token;
    if (headerCsrf || bodyCsrf) {
      setCsrfToken(headerCsrf || bodyCsrf);
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (
      status === 401 &&
      (code === 'TOKEN_EXPIRED' || code === 'TOKEN_REQUIRED') &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/refresh_token')
    ) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = api
          .post('/auth/refresh_token', {})
          .then((res) => {
            setCsrfToken(res.headers['x-csrf-token'] || res.data?.csrf_token);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      return api(original);
    }

    return Promise.reject(error);
  }
);
```

### 3.3. Arranque de sesión al cargar la SPA (`GET /auth/session`)

Al iniciar la aplicación React (`App.tsx` / `AuthProvider`), invocar:

```ts
const { data } = await api.get('/auth/session');
// data => { authenticated: true, user: { id, mail, profile, laboratory }, csrf_token: '...' }
```

### 3.4. Descarga de Documentos PDF (sin `?access_token=`)

Reemplazar cualquier `window.open(\`\${API_URL}/essays/download-document?id=...\${token}\`)` por:
- Con cookies `SameSite=Lax` + `COOKIE_DOMAIN=.ctmueble.com.ar`, una navegación directa o `<a href="https://gestion.ctmueble.com.ar/essays/download-document?documentId=..." target="_blank" rel="noopener noreferrer">` envía automáticamente la cookie `ctm_at`.
- Alternativamente (compatible también con Previews `SameSite=None`), descargar como `Blob`:

```ts
export async function downloadEssayPdf(documentId: string, fallbackName = 'documento.pdf') {
  const res = await api.get('/essays/download-document', {
    params: { documentId },
    responseType: 'blob',
  });
  const blobUrl = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}
```

---

## 4. Cabeceras CSP y Seguridad HTTP para el proyecto Vercel del Frontend (`oficina.ctmueble.com.ar`)

Agregar en el `vercel.json` del repositorio de la SPA React (`oficina.ctmueble.com.ar`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.r2.dev; connect-src 'self' https://gestion.ctmueble.com.ar; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), camera=(), microphone=(), payment=()"
        }
      ]
    }
  ]
}
```
