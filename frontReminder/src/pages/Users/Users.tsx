import React, { useState } from 'react';
import { ContentLoader } from '../../components/LoadingSpinner';
import { useUsers } from '../../hooks';

const Users: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { users, loading, error, stats, toggleUserStatus } = useUsers();

    const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await toggleUserStatus(userId, !isActive);
        } catch (err) {
            // El error ya se maneja en el hook
        }
    };

    const filteredUsers = (users || []).filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <ContentLoader message="Cargando usuarios..." />;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Barra de búsqueda */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Buscar usuarios por nombre, email o username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-600">Total Usuarios</h3>
                        <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-600">Usuarios Activos</h3>
                        <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-red-600">Usuarios Inactivos</h3>
                        <p className="text-2xl font-bold text-red-900">{stats.inactive}</p>
                    </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha de Registro
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={!user.is_active ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <span className="text-white font-medium">
                                                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                            className={`mr-3 ${user.is_active
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-green-600 hover:text-green-900'
                                                }`}
                                        >
                                            {user.is_active ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {searchTerm ? 'No se encontraron usuarios con ese criterio de búsqueda' : 'No hay usuarios registrados'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
