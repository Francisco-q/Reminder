import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailySchedule, Medication } from '../types/index';

const MEDICATIONS_KEY = '@medications';
const DAILY_SCHEDULE_KEY = '@daily_schedule';
const SCHEDULE_DATE_KEY = '@schedule_date';

export class StorageService {
    static async saveMedications(medications: Medication[]): Promise<void> {
        try {
            await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
        } catch (error) {
            console.error('Error saving medications:', error);
            throw error;
        }
    }

    static async getMedications(): Promise<Medication[]> {
        try {
            const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting medications:', error);
            return [];
        }
    }

    static async saveDailySchedule(schedule: DailySchedule[]): Promise<void> {
        try {
            await AsyncStorage.setItem(DAILY_SCHEDULE_KEY, JSON.stringify(schedule));
            await AsyncStorage.setItem(SCHEDULE_DATE_KEY, new Date().toDateString());
        } catch (error) {
            console.error('Error saving daily schedule:', error);
            throw error;
        }
    }

    static async getDailySchedule(): Promise<{ schedule: DailySchedule[]; isToday: boolean }> {
        try {
            const scheduleData = await AsyncStorage.getItem(DAILY_SCHEDULE_KEY);
            const dateData = await AsyncStorage.getItem(SCHEDULE_DATE_KEY);
            const today = new Date().toDateString();

            if (scheduleData && dateData === today) {
                return {
                    schedule: JSON.parse(scheduleData),
                    isToday: true
                };
            }

            return {
                schedule: [],
                isToday: false
            };
        } catch (error) {
            console.error('Error getting daily schedule:', error);
            return { schedule: [], isToday: false };
        }
    }

    static async clearAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([MEDICATIONS_KEY, DAILY_SCHEDULE_KEY, SCHEDULE_DATE_KEY]);
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }
}
