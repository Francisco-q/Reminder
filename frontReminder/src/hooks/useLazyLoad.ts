import { useCallback, useEffect, useState } from 'react';

interface UseLazyLoadOptions {
    threshold?: number;
    rootMargin?: string;
    enabled?: boolean;
}

/**
 * Hook para implementar lazy loading basado en intersection observer
 */
export const useLazyLoad = (
    loadFunction: () => Promise<any>,
    dependencies: any[] = [],
    options: UseLazyLoadOptions = {}
) => {
    const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    const loadData = useCallback(async () => {
        if (!shouldLoad || !enabled) return;

        try {
            setLoading(true);
            setError(null);
            const result = await loadFunction();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            console.error('Lazy load error:', err);
        } finally {
            setLoading(false);
        }
    }, [shouldLoad, enabled, loadFunction]);

    // Trigger de carga automática cuando shouldLoad cambia
    useEffect(() => {
        if (shouldLoad) {
            loadData();
        }
    }, [loadData, ...dependencies]);

    // Función para crear el ref del intersection observer
    const createRef = useCallback(() => {
        let observer: IntersectionObserver | null = null;

        return (node: HTMLElement | null) => {
            if (node && enabled) {
                observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting && !shouldLoad) {
                            setShouldLoad(true);
                            observer?.disconnect();
                        }
                    },
                    { threshold, rootMargin }
                );
                observer.observe(node);
            }
        };
    }, [threshold, rootMargin, enabled, shouldLoad]);

    // Función manual para disparar la carga
    const triggerLoad = useCallback(() => {
        setShouldLoad(true);
    }, []);

    return {
        data,
        loading,
        error,
        shouldLoad,
        triggerLoad,
        createRef,
        reload: loadData
    };
};

/**
 * Hook para cargar datos de forma progresiva (chunk por chunk)
 */
export const useProgressiveLoad = <T>(
    loadFunction: (offset: number, limit: number) => Promise<T[]>,
    chunkSize: number = 10
) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        try {
            setLoading(true);
            setError(null);
            const newData = await loadFunction(data.length, chunkSize);

            if (newData.length < chunkSize) {
                setHasMore(false);
            }

            setData(prev => [...prev, ...newData]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
            console.error('Progressive load error:', err);
        } finally {
            setLoading(false);
        }
    }, [data.length, chunkSize, loading, hasMore, loadFunction]);

    const reset = useCallback(() => {
        setData([]);
        setHasMore(true);
        setError(null);
    }, []);

    return {
        data,
        loading,
        hasMore,
        error,
        loadMore,
        reset
    };
};

/**
 * Hook para cache de datos con expiración
 */
export const useCachedData = <T>(
    key: string,
    loadFunction: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutos por defecto
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<number>(0);

    const isExpired = useCallback(() => {
        return Date.now() - lastFetch > ttl;
    }, [lastFetch, ttl]);

    const loadData = useCallback(async (forceRefresh = false) => {
        if (!forceRefresh && data && !isExpired()) {
            return data;
        }

        try {
            setLoading(true);
            setError(null);
            const result = await loadFunction();
            setData(result);
            setLastFetch(Date.now());

            // Cache en localStorage si es serializable
            try {
                localStorage.setItem(`cache_${key}`, JSON.stringify({
                    data: result,
                    timestamp: Date.now()
                }));
            } catch (e) {
                // Ignore localStorage errors
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos');
            console.error('Cached data load error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [key, data, isExpired, loadFunction]);

    // Cargar desde cache al inicializar
    useEffect(() => {
        try {
            const cached = localStorage.getItem(`cache_${key}`);
            if (cached) {
                const { data: cachedData, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < ttl) {
                    setData(cachedData);
                    setLastFetch(timestamp);
                    return;
                }
            }
        } catch (e) {
            // Ignore cache errors, load fresh data
        }

        loadData();
    }, [key, ttl]); // Removed loadData from dependencies to avoid infinite loop

    const clearCache = useCallback(() => {
        localStorage.removeItem(`cache_${key}`);
        setData(null);
        setLastFetch(0);
    }, [key]);

    return {
        data,
        loading,
        error,
        isExpired: isExpired(),
        loadData,
        clearCache
    };
};

export default useLazyLoad;
