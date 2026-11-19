import { createContext, useContext, useState, useCallback, useRef } from "react";
import { essaysService } from "../services/essaysService";
import { clientsService } from "../services/clientsService";
import { typesService } from "../services/typesService";
import { getCurrentUser } from "../services/usersService";

const DataCacheContext = createContext(null);

export function DataCacheProvider({ children }) {
  const [essayTypes, setEssayTypes] = useState(null);
  const [elementTemplates, setElementTemplates] = useState(null);
  const [countries, setCountries] = useState(null);
  const [districts, setDistricts] = useState(null);
  const [essays, setEssays] = useState(null);
  const [clients, setClients] = useState(null);
  const [user, setUser] = useState(null);

  // Promesas en curso para evitar requests duplicados
  const essayTypesPromiseRef = useRef(null);
  const elementTemplatesPromiseRef = useRef(null);
  const countriesPromiseRef = useRef(null);
  const districtsPromiseRef = useRef(null);
  const essaysPromiseRef = useRef(null);
  const clientsPromiseRef = useRef(null);
  const userPromiseRef = useRef(null);
  const essaysCacheKeyRef = useRef(null);
  const clientsCacheKeyRef = useRef(null);

  const getUserCacheKey = (u) => (u?.id ? `${u.id}:${u.profile || ""}` : null);

  // Refs de estado para mantener callbacks estables y evitar re-renders en cascada
  const essayTypesRef = useRef(essayTypes);
  essayTypesRef.current = essayTypes;
  const elementTemplatesRef = useRef(elementTemplates);
  elementTemplatesRef.current = elementTemplates;
  const countriesRef = useRef(countries);
  countriesRef.current = countries;
  const districtsRef = useRef(districts);
  districtsRef.current = districts;
  const essaysRef = useRef(essays);
  essaysRef.current = essays;
  const clientsRef = useRef(clients);
  clientsRef.current = clients;
  const userRef = useRef(user);
  userRef.current = user;

  const loadEssayTypes = useCallback(async (force = false) => {
    if (essayTypesRef.current && !force) return essayTypesRef.current;
    if (essayTypesPromiseRef.current && !force) return essayTypesPromiseRef.current;

    const p = typesService
      .getTypes({ type: "essays" })
      .then((data) => {
        setEssayTypes(data);
        essayTypesPromiseRef.current = null;
        return data;
      })
      .catch((err) => {
        essayTypesPromiseRef.current = null;
        throw err;
      });

    essayTypesPromiseRef.current = p;
    return p;
  }, []);

  const loadElementTemplates = useCallback(async (force = false) => {
    if (elementTemplatesRef.current && !force) return elementTemplatesRef.current;
    if (elementTemplatesPromiseRef.current && !force) return elementTemplatesPromiseRef.current;

    const p = essaysService
      .getElementTemplates()
      .then((data) => {
        setElementTemplates(data);
        elementTemplatesPromiseRef.current = null;
        return data;
      })
      .catch((err) => {
        elementTemplatesPromiseRef.current = null;
        throw err;
      });

    elementTemplatesPromiseRef.current = p;
    return p;
  }, []);

  const loadCountries = useCallback(async (force = false) => {
    if (countriesRef.current && !force) return countriesRef.current;
    if (countriesPromiseRef.current && !force) return countriesPromiseRef.current;

    const p = typesService
      .getTypes({ type: "countries" })
      .then((data) => {
        setCountries(data);
        countriesPromiseRef.current = null;
        return data;
      })
      .catch((err) => {
        countriesPromiseRef.current = null;
        throw err;
      });

    countriesPromiseRef.current = p;
    return p;
  }, []);

  const loadDistricts = useCallback(async (force = false) => {
    if (districtsRef.current && !force) return districtsRef.current;
    if (districtsPromiseRef.current && !force) return districtsPromiseRef.current;

    const p = typesService
      .getTypes({ type: "districts" })
      .then((data) => {
        const normalized = Array.isArray(data)
          ? data.map((d) => ({
              ...d,
              id: d?.id != null ? String(d.id).trim() : d?.id,
            }))
          : data;
        setDistricts(normalized);
        districtsPromiseRef.current = null;
        return normalized;
      })
      .catch((err) => {
        districtsPromiseRef.current = null;
        throw err;
      });

    districtsPromiseRef.current = p;
    return p;
  }, []);

  const loadUser = useCallback(async (force = false) => {
    if (userRef.current && !force) return userRef.current;
    if (userPromiseRef.current && !force) return userPromiseRef.current;

    const p = getCurrentUser()
      .then((data) => {
        const prevKey = getUserCacheKey(userRef.current);
        const nextKey = getUserCacheKey(data);
        if (prevKey && nextKey !== prevKey) {
          setEssays(null);
          setClients(null);
          essaysPromiseRef.current = null;
          clientsPromiseRef.current = null;
          essaysCacheKeyRef.current = null;
          clientsCacheKeyRef.current = null;
        }
        setUser(data);
        userPromiseRef.current = null;
        return data;
      })
      .catch((err) => {
        userPromiseRef.current = null;
        throw err;
      });

    userPromiseRef.current = p;
    return p;
  }, []);

  const refreshUser = useCallback(async () => {
    return loadUser(true);
  }, [loadUser]);

  const loadEssays = useCallback(async (force = false) => {
    let currentUser = userRef.current;
    if (!currentUser) {
      try {
        currentUser = await loadUser();
      } catch {
        // Ignorar error si no hay usuario
      }
    }

    const cacheKey = getUserCacheKey(currentUser);
    if (essaysRef.current && !force && essaysCacheKeyRef.current === cacheKey) {
      return essaysRef.current;
    }
    if (essaysPromiseRef.current?.cacheKey === cacheKey && !force) {
      return essaysPromiseRef.current.promise;
    }

    const promise = essaysService
      .fetch()
      .then((data) => {
        if (getUserCacheKey(userRef.current) === cacheKey) {
          setEssays(data);
          essaysCacheKeyRef.current = cacheKey;
        }
        if (essaysPromiseRef.current?.promise === promise) {
          essaysPromiseRef.current = null;
        }
        return data;
      })
      .catch((err) => {
        if (essaysPromiseRef.current?.promise === promise) {
          essaysPromiseRef.current = null;
        }
        throw err;
      });

    essaysPromiseRef.current = { cacheKey, promise };
    return promise;
  }, [loadUser]);

  const refreshEssays = useCallback(async () => {
    return loadEssays(true);
  }, [loadEssays]);

  const loadClients = useCallback(async (force = false) => {
    let currentUser = userRef.current;
    if (!currentUser) {
      try {
        currentUser = await loadUser();
      } catch {
        // Ignorar error si no hay usuario
      }
    }

    const cacheKey = getUserCacheKey(currentUser);
    if (clientsRef.current && !force && clientsCacheKeyRef.current === cacheKey) {
      return clientsRef.current;
    }
    if (clientsPromiseRef.current?.cacheKey === cacheKey && !force) {
      return clientsPromiseRef.current.promise;
    }

    const isLab = currentUser?.profile === "LABORATORY";
    const fetchReq = isLab ? clientsService.getScheduled() : clientsService.fetch();

    const promise = fetchReq
      .catch((err) => {
        // Fallback preventivo si un endpoint específico de laboratorio devuelve 403
        if (err?.response?.status === 403 && isLab) {
          return clientsService.fetch();
        }
        throw err;
      })
      .then((data) => {
        if (getUserCacheKey(userRef.current) === cacheKey) {
          setClients(data);
          clientsCacheKeyRef.current = cacheKey;
        }
        if (clientsPromiseRef.current?.promise === promise) {
          clientsPromiseRef.current = null;
        }
        return data;
      })
      .catch((err) => {
        if (clientsPromiseRef.current?.promise === promise) {
          clientsPromiseRef.current = null;
        }
        throw err;
      });

    clientsPromiseRef.current = { cacheKey, promise };
    return promise;
  }, [loadUser]);

  const refreshClients = useCallback(async () => {
    return loadClients(true);
  }, [loadClients]);

  const clearUser = useCallback(() => {
    setUser(null);
    setEssays(null);
    setClients(null);
    userPromiseRef.current = null;
    essaysPromiseRef.current = null;
    clientsPromiseRef.current = null;
    essaysCacheKeyRef.current = null;
    clientsCacheKeyRef.current = null;
  }, []);

  const addEssayType = useCallback((type) => {
    setEssayTypes((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.some((item) => String(item.id) === String(type.id));
      if (exists) {
        return list.map((item) => (String(item.id) === String(type.id) ? type : item));
      }
      return [...list, type].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
    });
  }, []);

  const addTemplate = useCallback((template) => {
    setElementTemplates((prev) => {
      if (!prev) return [template];
      const exists = prev.some((t) => String(t.id) === String(template.id));
      if (exists) {
        return prev.map((t) => (String(t.id) === String(template.id) ? template : t));
      }
      return [...prev, template];
    });
  }, []);

  const upsertEssay = useCallback((essay) => {
    setEssays((prev) => {
      if (!prev) return [essay];
      const idx = prev.findIndex((e) => String(e.id) === String(essay.id));
      if (idx === -1) return [essay, ...prev];
      const next = prev.slice();
      next[idx] = essay;
      return next;
    });
  }, []);

  const upsertClient = useCallback((client) => {
    setClients((prev) => {
      if (!prev) return [client];
      const idx = prev.findIndex((c) => String(c.id) === String(client.id));
      if (idx === -1) return [client, ...prev];
      const next = prev.slice();
      next[idx] = client;
      return next;
    });
  }, []);

  const value = {
    essayTypes,
    elementTemplates,
    countries,
    districts,
    essays,
    clients,
    user,
    loadEssayTypes,
    loadElementTemplates,
    loadCountries,
    loadDistricts,
    loadEssays,
    refreshEssays,
    loadClients,
    refreshClients,
    loadUser,
    refreshUser,
    clearUser,
    addEssayType,
    addTemplate,
    upsertEssay,
    upsertClient,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const ctx = useContext(DataCacheContext);
  if (!ctx) {
    throw new Error("useDataCache must be used within a DataCacheProvider");
  }
  return ctx;
}
