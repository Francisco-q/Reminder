import { useCallback, useEffect, useState } from 'react';
import { NotificationService } from '../services/NotificationService';
import { StorageService } from '../services/StorageService';
import { DailySchedule, Medication, TodayProgress } from '../types/index';

const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

export const useMedications = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const savedMedications = await StorageService.getMedications();
            const { schedule, isToday } = await StorageService.getDailySchedule();

            setMedications(savedMedications);

            if (isToday && schedule.length > 0) {
                setDailySchedule(schedule);
            } else {
                // Generar nuevo horario para hoy
                generateDailySchedule(savedMedications);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateDailySchedule = useCallback((meds: Medication[]) => {
        const schedule: DailySchedule[] = [];
        meds.forEach((med) => {
            med.times.forEach((time) => {
                schedule.push({
                    medicationId: med.id,
                    time,
                    taken: false,
                });
            });
        });

        schedule.sort((a, b) => a.time.localeCompare(b.time));
        setDailySchedule(schedule);
        StorageService.saveDailySchedule(schedule);
    }, []);

    const addMedication = useCallback(async (medicationData: Omit<Medication, 'id' | 'color'>) => {
        const newMedication: Medication = {
            ...medicationData,
            id: Date.now().toString(),
            color: colors[medications.length % colors.length],
        };

        const updatedMedications = [...medications, newMedication];
        setMedications(updatedMedications);
        await StorageService.saveMedications(updatedMedications);

        // Regenerar horario diario
        generateDailySchedule(updatedMedications);

        // Programar notificaciones
        NotificationService.scheduleAllNotifications(updatedMedications);

        return newMedication;
    }, [medications, generateDailySchedule]);

    const toggleMedicationTaken = useCallback(async (medicationId: string, time: string) => {
        const updatedSchedule = dailySchedule.map((item) => {
            if (item.medicationId === medicationId && item.time === time) {
                return {
                    ...item,
                    taken: !item.taken,
                    takenAt: !item.taken ? new Date().toLocaleTimeString() : undefined,
                };
            }
            return item;
        });

        setDailySchedule(updatedSchedule);
        await StorageService.saveDailySchedule(updatedSchedule);
    }, [dailySchedule]);

    const getTodayProgress = useCallback((): TodayProgress => {
        const total = dailySchedule.length;
        const taken = dailySchedule.filter((item) => item.taken).length;
        return {
            taken,
            total,
            percentage: total > 0 ? (taken / total) * 100 : 0
        };
    }, [dailySchedule]);

    const getUpcomingMedications = useCallback(() => {
        const now = new Date();
        const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        return dailySchedule
            .filter((item) => !item.taken && item.time >= currentTimeStr)
            .slice(0, 3);
    }, [dailySchedule]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        medications,
        dailySchedule,
        loading,
        addMedication,
        toggleMedicationTaken,
        getTodayProgress,
        getUpcomingMedications,
        refetch: loadData,
    };
};
