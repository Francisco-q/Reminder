import React, { useEffect, useState } from 'react';
import { monitoringService } from '../../services';
import type { FeatureSyncStatus, SystemHealth } from '../../types';

interface MonitoringData {
  system_health: SystemHealth;
  feature_sync: FeatureSyncStatus[];
  api_tests: Array<{
    endpoint: string;
    method: string;
    status: 'passed' | 'failed';
    response_time: number;
    last_run: string;
    error?: string;
  }>;
  recent_alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
}

const Monitoring: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMonitoringData();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const monitoringData = await monitoringService.getMonitoringDashboard();
      setData(monitoringData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos de monitoreo');
      console.error('Error loading monitoring data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringData();
  };

  const runSystemTests = async () => {
    try {
      setRefreshing(true);
      await monitoringService.runApiTests();
      await loadMonitoringData();
    } catch (err) {
      setError('Error al ejecutar las pruebas del sistema');
      console.error('Error running system tests:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'synced':
      case 'passed':
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'pending':
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'error':
      case 'failed':
      case 'down':
      case 'out_of_sync':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'synced':
      case 'passed':
      case 'up':
        return '✓';
      case 'warning':
      case 'pending':
      case 'partial':
        return '⚠';
      case 'critical':
      case 'error':
      case 'failed':
      case 'down':
      case 'out_of_sync':
        return '✗';
      default:
        return '?';
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const safeData = data || {
    system_health: {
      status: 'unknown',
      components: {},
      metrics: {},
      score: 0,
      timestamp: new Date().toISOString()
    },
    api_tests: [],
    recent_alerts: []
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sistema de Monitoreo</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={runSystemTests}
            disabled={refreshing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Ejecutar Pruebas
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Estado del Sistema */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Estado del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(safeData.system_health?.status || 'unknown')}`}>
                  {getStatusIcon(safeData.system_health?.status || 'unknown')} {(safeData.system_health?.status || 'UNKNOWN').toUpperCase()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Estado General</p>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((safeData.system_health?.components as any)?.database || 'unknown')}`}>
                  {getStatusIcon((safeData.system_health?.components as any)?.database || 'unknown')} Base de Datos
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((safeData.system_health?.components as any)?.api || 'unknown')}`}>
                  {getStatusIcon((safeData.system_health?.components as any)?.api || 'unknown')} API
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((safeData.system_health?.components as any)?.notifications || 'unknown')}`}>
                  {getStatusIcon((safeData.system_health?.components as any)?.notifications || 'unknown')} Notificaciones
                </div>
              </div>
            </div>

            {/* Métricas del sistema */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Usuarios</h4>
                <p className="text-2xl font-bold text-blue-600">{(safeData.system_health?.metrics as any)?.users_count || 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Medicamentos</h4>
                <p className="text-2xl font-bold text-green-600">{(safeData.system_health?.metrics as any)?.medications_count || 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Horarios Hoy</h4>
                <p className="text-2xl font-bold text-purple-600">{(safeData.system_health?.metrics as any)?.schedules_today || 0}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tiempo de Respuesta</h4>
                <p className="text-2xl font-bold text-orange-600">{(safeData.system_health?.metrics as any)?.response_time_ms || 0}ms</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Puntuación de salud: {safeData.system_health?.score || 0}/100 | Última verificación: {safeData.system_health?.timestamp ? new Date(safeData.system_health.timestamp).toLocaleString() : 'N/A'}
            </div>
          </div>

          {/* Pruebas de API */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pruebas de API</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo de Respuesta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Ejecución
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeData.api_tests.map((test, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {test.endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {test.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)} {test.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.response_time}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(test.last_run).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas Recientes */}
          {safeData.recent_alerts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Alertas Recientes</h2>
              <div className="space-y-3">
                {safeData.recent_alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.type === 'error' ? 'bg-red-50 border-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                    }`}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
          )}
    </div>
  );
};

export default Monitoring;
