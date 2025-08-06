import React, { useEffect, useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon } from './components/Icon';
import { useMedications } from './hooks/useMedications';
import { AddMedicationScreen } from './screens/AddMedicationScreen';
import { TodayScreen } from './screens/TodayScreen';
import { NotificationService } from './services/NotificationService';
import { Medication } from './types';

type Screen = 'today' | 'add-medication';

const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('today');
    const { addMedication } = useMedications();

    useEffect(() => {
        // Inicializar notificaciones
        NotificationService.initialize();
        NotificationService.requestPermissions();
    }, []);

    const handleAddMedication = () => {
        setCurrentScreen('add-medication');
    };

    const handleSaveMedication = async (medicationData: Omit<Medication, 'id' | 'color'>) => {
        try {
            await addMedication(medicationData);
            setCurrentScreen('today');
        } catch (error) {
            console.error('Error saving medication:', error);
        }
    };

    const handleCancel = () => {
        setCurrentScreen('today');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'today':
                return <TodayScreen onAddMedication={handleAddMedication} />;
            case 'add-medication':
                return (
                    <AddMedicationScreen
                        onSave={handleSaveMedication}
                        onCancel={handleCancel}
                    />
                );
            default:
                return <TodayScreen onAddMedication={handleAddMedication} />;
        }
    };

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Icon name="pill" size={32} />
                        <View>
                            <Text style={styles.headerTitle}>Recordatorio de Medicamentos</Text>
                            <Text style={styles.headerSubtitle}>
                                Mantén tu salud al día con recordatorios inteligentes
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Screen Content */}
                <View style={styles.content}>
                    {renderScreen()}
                </View>
            </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        fontSize: 32,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
});

export default App;
