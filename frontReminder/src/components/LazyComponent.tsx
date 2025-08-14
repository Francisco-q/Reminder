import React, { Suspense } from 'react';
import { ContentLoader } from './LoadingSpinner';

interface LazyComponentProps {
    fallback?: React.ReactNode;
    error?: React.ReactNode;
    delay?: number;
}

/**
 * HOC para crear componentes lazy con manejo de errores mejorado
 */
export function withLazyLoading<P extends object>(
    loadComponent: () => Promise<{ default: React.ComponentType<P> }>,
    options: LazyComponentProps = {}
) {
    const LazyComponent = React.lazy(loadComponent);

    return React.forwardRef<any, P>((props, ref) => {
        const {
            fallback = <ContentLoader />,
            error: ErrorComponent = (
                <div className="text-center py-8 text-red-600">
                    <p>Error al cargar el componente</p>
                </div>
            )
        } = options;

        return (
            <ErrorBoundary fallback={ErrorComponent}>
                <Suspense fallback={fallback}>
                    <LazyComponent {...props} ref={ref} />
                </Suspense>
            </ErrorBoundary>
        );
    });
}

/**
 * Error Boundary para componentes lazy
 */
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Lazy component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

/**
 * Hook para precargar componentes lazy
 */
export const usePreloadComponent = () => {
    const preloadedComponents = React.useRef<Set<() => Promise<any>>>(new Set());

    const preload = React.useCallback((loadFunction: () => Promise<any>) => {
        if (!preloadedComponents.current.has(loadFunction)) {
            preloadedComponents.current.add(loadFunction);

            // Precargar después de un pequeño delay para no bloquear el render inicial
            setTimeout(() => {
                loadFunction().catch(error => {
                    console.warn('Component preload failed:', error);
                });
            }, 100);
        }
    }, []);

    return { preload };
};

/**
 * Componente para precargar recursos en background
 */
export const ResourcePreloader: React.FC<{
    resources: Array<() => Promise<any>>;
    onLoad?: (index: number) => void;
    onError?: (index: number, error: Error) => void;
}> = ({ resources, onLoad, onError }) => {
    React.useEffect(() => {
        resources.forEach(async (resource, index) => {
            try {
                await resource();
                onLoad?.(index);
            } catch (error) {
                onError?.(index, error as Error);
            }
        });
    }, [resources, onLoad, onError]);

    return null; // Este componente no renderiza nada
};

export default withLazyLoading;
