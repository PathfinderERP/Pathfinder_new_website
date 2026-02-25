import { useState, useEffect, useCallback, useRef } from "react";

// Shared memory cache to prevent redundant JSON parsing and API calls during a session
const memoryCache = {};

/**
 * Custom hook for fetching data with automatic memory and local storage caching.
 */
export const useCachedData = (cacheKey, fetchFn, options = {}) => {
    const {
        onSuccess = (data) => data,
        initialData = [],
        persistent = true
    } = options;

    const isMounted = useRef(true);

    // Initialize from memory or persistent storage for instant content
    const [data, setData] = useState(() => {
        if (memoryCache[cacheKey]) return memoryCache[cacheKey];

        if (persistent) {
            try {
                const stored = localStorage.getItem(`pathfinder_${cacheKey}_cache`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    memoryCache[cacheKey] = parsed;
                    return parsed;
                }
            } catch (e) {
                console.warn(`[CACHE] Error reading persistent cache for ${cacheKey}`, e);
            }
        }
        return initialData;
    });

    const [loading, setLoading] = useState(() => {
        if (memoryCache[cacheKey]) return false;
        if (persistent && localStorage.getItem(`pathfinder_${cacheKey}_cache`)) return false;
        return true;
    });

    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            if (!memoryCache[cacheKey] && data.length === 0) {
                setLoading(true);
            }

            const response = await fetchFn();
            const rawData = response?.data !== undefined ? response.data : response;
            const processedData = onSuccess(rawData);

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
            if (data.length === 0) {
                setError(err.message || 'Failed to load data');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [cacheKey, persistent, data.length]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();
        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    return { data, loading, error, setData, refetch: fetchData };
};
