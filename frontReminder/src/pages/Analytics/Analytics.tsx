import React, { useState } from 'react';
import { ContentLoader } from '../../components/LoadingSpinner';
import { useCachedData } from '../../hooks';
import { analyticsService } from '../../services';

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Usar cache para los datos de analytics con TTL de 2 minutos
  const {
    data,
    loading,
    error,
    loadData
  } = useCachedData(
    `analytics_${selectedPeriod}`,
    () => analyticsService.getAnalytics(selectedPeriod),
    2 * 60 * 1000 // 2 minutos
  );

  // Recargar datos cuando cambia el período
  React.useEffect(() => {
    loadData(true); // Force refresh when period changes
  }, [selectedPeriod]);

  if (loading) {
    return <ContentLoader message="Cargando estadísticas..." />;
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Error al cargar los datos'}
        </div>
      </div>
    );
  }

  // Fallback data para evitar errores de undefined
  const safeData = {
    medicationStats: {
      totalMedications: 0,
      activeMedications: 0,
      lowStockMedications: 0,
      medicationsByType: {},
      ...(data?.medicationStats || {})
    },
    adherenceStats: {
      adherenceRate: 0,
      completedSchedules: 0,
      totalSchedules: 0,
      weeklyAdherence: [],
      ...(data?.adherenceStats || {})
    },
    userStats: {
      activeUsers: 0,
      newUsersThisMonth: 0,
      ...(data?.userStats || {})
    },
    ...(data || {})
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics y Estadísticas</h1>

        {/* Selector de período */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
        </select>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Medicamentos</h3>
          <p className="text-3xl font-bold text-blue-600">{safeData.medicationStats.totalMedications}</p>
          <p className="text-sm text-gray-500 mt-1">
            {safeData.medicationStats.activeMedications} activos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Adherencia</h3>
          <p className="text-3xl font-bold text-green-600">
            {safeData.adherenceStats.adherenceRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {safeData.adherenceStats.completedSchedules}/{safeData.adherenceStats.totalSchedules} dosis
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Stock Bajo</h3>
          <p className="text-3xl font-bold text-red-600">{safeData.medicationStats.lowStockMedications}</p>
          <p className="text-sm text-gray-500 mt-1">medicamentos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Usuarios Activos</h3>
          <p className="text-3xl font-bold text-purple-600">{safeData.userStats.activeUsers}</p>
          <p className="text-sm text-gray-500 mt-1">
            {safeData.userStats.newUsersThisMonth} nuevos este mes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de adherencia semanal */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Adherencia Semanal</h3>
          <div className="space-y-3">
            {(safeData.adherenceStats?.weeklyAdherence || []).map((rate, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm text-gray-600 w-16">
                  Día {index + 1}
                </span>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-800 w-12">
                  {rate.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Medicamentos por tipo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Medicamentos por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(safeData.medicationStats?.medicationsByType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {type.replace('_', ' ')}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(count / (safeData.medicationStats?.totalMedications || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas y recomendaciones */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas y Recomendaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(safeData.medicationStats?.lowStockMedications || 0) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Stock Bajo</h4>
                  <p className="text-sm text-red-700">
                    {safeData.medicationStats?.lowStockMedications || 0} medicamentos necesitan reabastecimiento
                  </p>
                </div>
              </div>
            </div>
          )}

          {(safeData.adherenceStats?.adherenceRate || 0) < 80 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Adherencia Baja</h4>
                  <p className="text-sm text-yellow-700">
                    La adherencia está por debajo del 80%. Considera ajustar recordatorios.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
