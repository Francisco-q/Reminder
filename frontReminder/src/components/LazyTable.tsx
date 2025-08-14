import React, { useCallback, useEffect, useRef } from 'react';
import { useProgressiveLoad } from '../hooks';
import { InlineLoader } from './LoadingSpinner';

interface LazyTableProps<T> {
    loadFunction: (offset: number, limit: number) => Promise<T[]>;
    renderRow: (item: T, index: number) => React.ReactNode;
    renderHeader?: () => React.ReactNode;
    chunkSize?: number;
    className?: string;
    emptyMessage?: string;
    loadingMessage?: string;
}

function LazyTable<T>({
    loadFunction,
    renderRow,
    renderHeader,
    chunkSize = 20,
    className = '',
    emptyMessage = 'No hay datos disponibles',
    loadingMessage = 'Cargando más elementos...'
}: LazyTableProps<T>) {
    const { data, loading, hasMore, error, loadMore } = useProgressiveLoad(loadFunction, chunkSize);
    const observerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer para infinite scroll
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
            loadMore();
        }
    }, [hasMore, loading, loadMore]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
            rootMargin: '100px'
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [handleObserver]);

    // Cargar primer chunk al montar
    useEffect(() => {
        if ((data || []).length === 0 && !loading) {
            loadMore();
        }
    }, [(data || []).length, loading, loadMore]);

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error al cargar los datos: {error}</p>
            </div>
        );
    }

    return (
        <div className={`lazy-table ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    {renderHeader && renderHeader()}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(data || []).map((item, index) => renderRow(item, index))}
                    </tbody>
                </table>
            </div>

            {/* Loading indicator */}
            {loading && (
                <InlineLoader message={loadingMessage} />
            )}

            {/* Intersection observer target */}
            {hasMore && !loading && <div ref={observerRef} className="h-4" />}

            {/* Empty state */}
            {(data || []).length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <p>{emptyMessage}</p>
                </div>
            )}

            {/* End of list indicator */}
            {!hasMore && (data || []).length > 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                    No hay más elementos para mostrar
                </div>
            )}
        </div>
    );
}

export default LazyTable;
