import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Bell, Clock, Pill } from 'lucide-react';
import React from 'react';
import { useMedications, useNotifications, useTodaySchedules } from '../../hooks';

const Dashboard: React.FC = () => {
  const { schedules: todaySchedules, loading: schedulesLoading } = useTodaySchedules();
  const { medications, loading: medicationsLoading } = useMedications();
  const { notifications, loading: notificationsLoading } = useNotifications();

  // Calcular estadísticas
  const totalMedications = medications?.length || 0;
  const activeMedications = medications?.filter(med => med.is_active)?.length || 0;
  const todayTotal = todaySchedules?.length || 0;
  const todayCompleted = todaySchedules?.filter(schedule => schedule.is_taken)?.length || 0;
  const todayPending = todayTotal - todayCompleted;
  const unreadNotifications = notifications?.filter(notif => !notif.is_read)?.length || 0;

  const upcomingSchedules = todaySchedules
    ?.filter(schedule => !schedule.is_taken)
    ?.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
    ?.slice(0, 5) || [];

  const recentNotifications = notifications
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    ?.slice(0, 5) || [];

  const lowStockMedications = medications
    ?.filter(med => med.current_stock !== null && med.current_stock <= 5 && med.is_active)
    ?.slice(0, 3) || [];

  const stats = [
    {
      name: 'Medicamentos Activos',
      value: activeMedications,
      total: totalMedications,
      icon: Pill,
      color: 'bg-blue-500',
    },
    {
      name: 'Tomas de Hoy',
      value: todayCompleted,
      total: todayTotal,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      name: 'Pendientes',
      value: todayPending,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      name: 'Notificaciones',
      value: unreadNotifications,
      icon: Bell,
      color: 'bg-purple-500',
    },
  ];

  if (schedulesLoading || medicationsLoading || notificationsLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen de tu actividad de medicamentos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.total ? `${stat.value}/${stat.total}` : stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Próximas Tomas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Próximas Tomas
            </h3>
          </div>
          <div className="p-6">
            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-4">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  No tienes tomas pendientes para hoy
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Pill className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {schedule.medication_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule.dosage} - {schedule.scheduled_time}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${new Date(`${schedule.date}T${schedule.scheduled_time}`) > new Date()
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {new Date(`${schedule.date}T${schedule.scheduled_time}`) > new Date()
                        ? 'Pendiente'
                        : 'Retrasado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones Recientes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Notificaciones Recientes
            </h3>
          </div>
          <div className="p-6">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-4">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  No tienes notificaciones recientes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md border ${notification.is_read
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medicamentos con Stock Bajo */}
        {lowStockMedications.length > 0 && (
          <div className="bg-white shadow rounded-lg lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                Medicamentos con Stock Bajo
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {lowStockMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="border border-yellow-200 rounded-md p-4 bg-yellow-50"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Pill className="w-4 h-4 text-yellow-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {medication.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {medication.current_stock} {medication.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
