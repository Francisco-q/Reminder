import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMedications } from '../../hooks';
import { Plus, Search, Pill, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { medicationService } from '../../services';

const Medications: React.FC = () => {
  const { medications, loading, refetch } = useMedications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'low_stock'>('all');

  const filteredMedications = medications?.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.active_ingredient?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = (() => {
      switch (filter) {
        case 'active':
          return medication.is_active;
        case 'inactive':
          return !medication.is_active;
        case 'low_stock':
          return medication.current_stock !== null && medication.current_stock <= 5;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  }) || [];

  const handleDelete = async (medicationId: string, medicationName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${medicationName}"?`)) {
      try {
        await medicationService.deleteMedication(medicationId);
        toast.success('Medicamento eliminado exitosamente');
        refetch();
      } catch (error) {
        toast.error('Error al eliminar el medicamento');
      }
    }
  };

  const handleToggleActive = async (medicationId: string, isActive: boolean) => {
    try {
      await medicationService.updateMedication(medicationId, { is_active: !isActive });
      toast.success(`Medicamento ${!isActive ? 'activado' : 'desactivado'} exitosamente`);
      refetch();
    } catch (error) {
      toast.error('Error al actualizar el medicamento');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medicamentos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestiona tu lista de medicamentos
            </p>
          </div>
          <Link
            to="/medications/new"
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Medicamento
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar medicamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="low_stock">Stock Bajo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de medicamentos */}
      {filteredMedications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Pill className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm || filter !== 'all' 
              ? 'No se encontraron medicamentos'
              : 'No tienes medicamentos registrados'
            }
          </h3>
          <p className="mt-2 text-gray-500">
            {searchTerm || filter !== 'all'
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Comienza agregando tu primer medicamento'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <Link
              to="/medications/new"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Medicamento
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedications.map((medication) => (
            <div
              key={medication.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        medication.is_active ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Pill className={`w-6 h-6 ${
                          medication.is_active ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {medication.name}
                        </h3>
                        {!medication.is_active && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactivo
                          </span>
                        )}
                        {medication.current_stock !== null && medication.current_stock <= 5 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Stock Bajo
                          </span>
                        )}
                      </div>
                      
                      {medication.active_ingredient && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Principio activo:</span> {medication.active_ingredient}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Presentación:</span> {medication.presentation} - {medication.concentration}
                      </p>
                      
                      {medication.current_stock !== null && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Stock actual:</span> {medication.current_stock} {medication.unit}
                        </p>
                      )}
                      
                      {medication.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          {medication.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(medication.id, medication.is_active)}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        medication.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {medication.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <Link
                      to={`/medications/${medication.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(medication.id, medication.name)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medications;
