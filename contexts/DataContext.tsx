import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface DataContextType {
    data: Record<string, any>;
    fetchData: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
    invalidateCache: (key: string) => void;
    clearAllCache: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const cache = useRef<Map<string, CacheEntry<any>>>(new Map());
    const inFlightRequests = useRef<Map<string, Promise<any>>>(new Map());
    const [data, setData] = useState<Record<string, any>>({});

    const fetchData = useCallback(async <T,>(key: string, fetcher: () => Promise<T>): Promise<T> => {
        // Check cache first
        const cached = cache.current.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`%c[CACHE HIT] ${key}`, 'color: green; font-weight: bold;');
            return cached.data as T;
        }

        // Check if request is already in-flight
        if (inFlightRequests.current.has(key)) {
            console.log(`%c[DEDUPE] ${key}`, 'color: blue; font-weight: bold;');
            return inFlightRequests.current.get(key) as Promise<T>;
        }

        console.log(`%c[API FETCH] ${key}`, 'color: orange; font-weight: bold;');

        // Fetch data
        const request = fetcher()
            .then((result) => {
                // Cache the result
                cache.current.set(key, {
                    data: result,
                    timestamp: Date.now(),
                });

                // Update state
                setData((prev) => ({ ...prev, [key]: result }));

                // Remove from in-flight
                inFlightRequests.current.delete(key);

                console.log(`%c[FETCH DONE] ${key}`, 'color: green;');
                return result;
            })
            .catch((error: any) => {
                // Remove from in-flight on error
                inFlightRequests.current.delete(key);

                // Check for "message channel closed" specifically
                if (error?.message?.includes('message channel closed') || error?.message?.includes('The message port closed before a response was received')) {
                    console.warn(`[SUPPRESSED] Background message channel closed. This is likely caused by a browser extension. Key: ${key} (คำเตือน: ข้อผิดพลาดนี้มักเกิดจากส่วนขยายของเบราว์เซอร์ และไม่ส่งผลกระทบต่อการทำงานของแอปพลิเคชัน)`);
                } else {
                    console.error(`%c[FETCH ERROR] ${key}`, 'color: red;', error);
                }

                throw error;
            });

        // Store in-flight request
        inFlightRequests.current.set(key, request);

        return request;
    }, []);

    const invalidateCache = useCallback((key: string) => {
        console.log(`[DataContext] Invalidating cache: ${key}`);
        cache.current.delete(key);
        setData((prev) => {
            const newData = { ...prev };
            delete newData[key];
            return newData;
        });
    }, []);

    const clearAllCache = useCallback(() => {
        console.log('[DataContext] Clearing all cache');
        cache.current.clear();
        inFlightRequests.current.clear();
        setData({});
    }, []);

    const value: DataContextType = {
        data,
        fetchData,
        invalidateCache,
        clearAllCache,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
