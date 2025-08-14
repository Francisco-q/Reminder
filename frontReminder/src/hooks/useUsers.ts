import { useEffect, useState } from 'react';
import { userService } from '../services';
import type { User } from '../types';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (err) {
            setError('Error al cargar los usuarios');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await userService.toggleUserStatus(userId, isActive);
            // Actualizar el usuario en el estado local
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, is_active: isActive } : user
                )
            );
        } catch (err) {
            setError('Error al cambiar el estado del usuario');
            console.error('Error toggling user status:', err);
            throw err; // Re-throw para que el componente pueda manejar el error
        }
    };

    const searchUsers = async (query: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.searchUsers(query);
            setUsers(data);
        } catch (err) {
            setError('Error al buscar usuarios');
            console.error('Error searching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        fetchUsers,
        toggleUserStatus,
        searchUsers,
        // Estadísticas útiles
        stats: {
            total: (users || []).length,
            active: (users || []).filter(user => user.is_active).length,
            inactive: (users || []).filter(user => !user.is_active).length,
        }
    };
};

export default useUsers;
