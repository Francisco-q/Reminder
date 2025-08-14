import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    message?: string;
    fullScreen?: boolean;
    color?: 'blue' | 'green' | 'red' | 'purple' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message = 'Cargando...',
    fullScreen = false,
    color = 'blue'
}) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        green: 'border-green-500',
        red: 'border-red-500',
        purple: 'border-purple-500',
        gray: 'border-gray-500'
    };

    const containerClasses = fullScreen
        ? 'min-h-screen flex items-center justify-center bg-white'
        : 'flex items-center justify-center p-8';

    return (
        <div className={containerClasses}>
            <div className="text-center">
                <div className={`animate-spin rounded-full border-b-2 mx-auto mb-4 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
                {message && (
                    <p className="text-gray-600 animate-pulse font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

// Componente específico para carga de páginas
export const PageLoader: React.FC<{ message?: string }> = ({
    message = 'Cargando página...'
}) => (
    <LoadingSpinner
        size="lg"
        message={message}
        fullScreen
        color="blue"
    />
);

// Componente para carga de contenido dentro de páginas
export const ContentLoader: React.FC<{ message?: string }> = ({
    message = 'Cargando contenido...'
}) => (
    <LoadingSpinner
        size="md"
        message={message}
        fullScreen={false}
        color="gray"
    />
);

// Componente para carga inline
export const InlineLoader: React.FC<{ message?: string }> = ({
    message = 'Cargando...'
}) => (
    <div className="flex items-center justify-center space-x-2 py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        {message && (
            <span className="text-sm text-gray-600">{message}</span>
        )}
    </div>
);

export default LoadingSpinner;
