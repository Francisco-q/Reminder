export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    notes?: string;
    color: string;
}

export interface DailySchedule {
    medicationId: string;
    time: string;
    taken: boolean;
    takenAt?: string;
}

export interface TodayProgress {
    taken: number;
    total: number;
    percentage: number;
}

export type RootStackParamList = {
    Main: undefined;
    AddMedication: undefined;
    MedicationDetail: { medication: Medication };
};

export type BottomTabParamList = {
    Today: undefined;
    Medications: undefined;
    Upcoming: undefined;
};
