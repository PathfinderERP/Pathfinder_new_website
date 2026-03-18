import { useState, useEffect, useCallback } from 'react'; // Ensure React hooks are imported
import { clearPublicCacheStore } from './useCachedData';

const CACHE_EXPIRY_MINUTES = 24 * 60; // 24 Hours (effectively until logout)
const ADMIN_CACHE_PREFIX = "admin_cache_";

// Helper to safely set localStorage with quota management
const safeSetLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (isQuotaExceeded(e)) {
            console.warn("📦 LocalStorage quota exceeded. Attempting to clear old admin cache...");
            // Strategy: Clear all admin cache and try one last time
            clearAllAdminCache();
            try {
                localStorage.setItem(key, value);
            } catch (retryError) {
                console.error("❌ Still exceeding quota after clearing cache. This item might be too large.", key);
            }
        } else {
            console.error("Storage error:", e);
        }
    }
};

const isQuotaExceeded = (e) => {
    return (
        e instanceof DOMException &&
        (e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
};

export const clearAllAdminCache = () => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(ADMIN_CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
    
};

export const clearAdminCache = (key) => {
    const cacheKey = `${ADMIN_CACHE_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
};

// Clear public website cache (from useCachedData)
export const clearPublicCache = (key) => {
    clearPublicCacheStore(key);
};

export const clearAdminCacheByPrefix = (prefix) => {
    const fullPrefix = `${ADMIN_CACHE_PREFIX}${prefix}`;
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(fullPrefix)) {
            localStorage.removeItem(key);
        }
    });
    
};

export const useAdminCache = (key, fetchFunction, options = {}) => {
    // Only apply prefix if key exists
    const cacheKey = key ? `${ADMIN_CACHE_PREFIX}${key}` : null;

    // Safety check for initialData
    const [data, setData] = useState(options.initialData || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to load from cache
    const loadFromCache = useCallback(() => {
        try {
            if (!cacheKey) return null;
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const parsed = JSON.parse(cached);
            const now = new Date().getTime();
            const age = (now - parsed.timestamp) / 1000 / 60; // Age in minutes

            const expiry = options.expiryMinutes || CACHE_EXPIRY_MINUTES;

            if (age < expiry) {
                return parsed.data;
            }
            return null;
        } catch (err) {
            console.warn("Cache parsing failed", err);
            localStorage.removeItem(cacheKey);
            return null;
        }
    }, [cacheKey]);

    // Main fetch function
    const fetchData = useCallback(async (forceRefresh = false) => {
        // If we have valid cached data and not forcing refresh, don't show loading spinner
        // This makes navigation instant
        if (forceRefresh || !data || (Array.isArray(data) && data.length === 0)) {
            setLoading(true);
        }

        setError(null);

        try {
            // 1. Try Cache First (if not forcing refresh)
            if (!forceRefresh) {
                const cachedData = loadFromCache();
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // 2. Network Fetch
            const result = await fetchFunction();

            // Determine what to save (handle different API response structures)
            const dataToSave = result.data || result;

            setData(dataToSave);

            // 3. Save to Cache
            if (cacheKey) {
                safeSetLocalStorage(cacheKey, JSON.stringify({
                    timestamp: new Date().getTime(),
                    data: dataToSave
                }));
            }

        } catch (err) {
            console.error(`Fetch failed for ${cacheKey}:`, err);
            setError(err.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }, [cacheKey, fetchFunction, loadFromCache]); // Removed 'data' dependency

    // Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // External update helper (e.g., after delete/edit)
    const updateCache = (newData) => {
        setData(newData);
        if (cacheKey) {
            safeSetLocalStorage(cacheKey, JSON.stringify({
                timestamp: new Date().getTime(),
                data: newData
            }));
        }
    };

    // Clear cache helper
    const clearCache = () => {
        if (cacheKey) localStorage.removeItem(cacheKey);
    };

    return {
        data,
        loading,
        error,
        refresh: () => fetchData(true),
        updateCache, // Use this for optimistic updates
        clearCache
    };
};
