import { useState, useEffect, useCallback, useRef } from "react";

// Shared memory cache to prevent redundant JSON parsing and API calls during a session
let memoryCache = {};

/**
 * Clear the public memory cache
 * @param {string} key Optional key to clear. If not provided, clears everything.
 */
export const clearPublicCacheStore = (key) => {
    if (key) {
        delete memoryCache[key];
        // Also clear by prefix logic if needed, but for now simple key delete
        // To handle prefixes (like alumni_images_):
        Object.keys(memoryCache).forEach(k => {
            if (k.startsWith(key)) {
                delete memoryCache[k];
            }
        });
        
        // Also clear localStorage
        const storageKey = `pathfinder_${key}_cache`;
        localStorage.removeItem(storageKey);
        
        // Clear all that start with the key in localStorage too
        const fullPrefix = `pathfinder_${key}`;
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(fullPrefix)) {
                localStorage.removeItem(k);
            }
        });
    } else {
        memoryCache = {};
        // Clear all pathfinder caches from localStorage
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('pathfinder_')) {
                localStorage.removeItem(k);
            }
        });
    }
};

/**
 * Custom hook for fetching data with automatic memory and local storage caching.
 */
export const useCachedData = (cacheKey, fetchFn, options = {}) => {
  const {
    onSuccess = (data) => data,
    initialData = [],
    persistent = true,
    revalidate = true // When true, still fetch fresh data even if we have cached data
  } = options;

  const isMounted = useRef(true);

  // Synchronously initialize from memory or persistent storage for TRUE instant content
  const [data, setData] = useState(() => {
    // 1. Memory is fastest
    if (memoryCache[cacheKey]) return memoryCache[cacheKey];

    // 2. Persistent storage is next
    if (persistent) {
      try {
        const stored = localStorage.getItem(`pathfinder_${cacheKey}_cache`);
        if (stored) {
          const parsed = JSON.parse(stored);
          memoryCache[cacheKey] = parsed;
          return parsed;
        }
      } catch (e) {
        console.warn(`[CACHE] Initial read error for ${cacheKey}`, e);
      }
    }

    // 3. Fallback to initial provided data
    return initialData;
  });

  const [loading, setLoading] = useState(() => {
    // IF we have ANY data (memory, storage, or initialData), don't show loading spinner
    // Especially important for "instant feel"
    if (memoryCache[cacheKey]) return false;
    
    // Check localStorage synchronously instead of waiting for effect
    const stored = persistent ? localStorage.getItem(`pathfinder_${cacheKey}_cache`) : null;
    if (stored) return false;
    
    // Only true loading if we have absolutely nothing
    return true;
  });

  const [error, setError] = useState(null);
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
    onSuccessRef.current = onSuccess;
  }, [fetchFn, onSuccess]);

  const fetchData = useCallback(async (force = false) => {
    // Skip if we already have data and don't want to revalidate in background
    if (memoryCache[cacheKey] && !revalidate && !force) {
      if (loading) setLoading(false);
      return;
    }

    // Only set loading true if we have NO data at all
    // This allows background "stale-while-revalidate" behavior
    if (!memoryCache[cacheKey] && data.length === 0) {
      setLoading(true);
    }

    try {
      const response = await fetchFnRef.current();
      const rawData = response?.data !== undefined ? response.data : response;
      const processedData = onSuccessRef.current(rawData);

      if (!isMounted.current) return;

      setData(processedData);
      memoryCache[cacheKey] = processedData;

      if (persistent) {
        try {
          localStorage.setItem(`pathfinder_${cacheKey}_cache`, JSON.stringify(processedData));
        } catch (e) {
          console.warn(`[CACHE] Local storage quota exceeded for ${cacheKey}`);
        }
      }
      setError(null);
    } catch (err) {
      if (!isMounted.current) return;
      console.error(`[CACHE] Fetch error for ${cacheKey}:`, err);
      // Only set error state if we don't have existing cached/initial data
      if (data.length === 0) {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [cacheKey, persistent, data.length, loading, revalidate]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();
        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    const updateData = useCallback((newData) => {
        setData(newData);
        memoryCache[cacheKey] = newData;
        if (persistent) {
            try {
                localStorage.setItem(`pathfinder_${cacheKey}_cache`, JSON.stringify(newData));
            } catch (e) {
                console.warn(`[CACHE] Local storage quota exceeded for ${cacheKey}`);
            }
        }
    }, [cacheKey, persistent]);

    return { data, loading, error, setData: updateData, refetch: fetchData };
};
