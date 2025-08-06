import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { useMedications } from '../hooks/useMedications';
import { DailySchedule } from '../types';

interface TodayScreenProps {
    onAddMedication: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ onAddMedication }) => {
    const {
        dailySchedule,
        medications,
        toggleMedicationTaken,
        getTodayProgress
    } = useMedications();

    const progress = getTodayProgress();

    const renderMedicationItem = ({ item }: { item: DailySchedule }) => {
        const medication = medications.find(m => m.id === item.medicationId);
        if (!medication) return null;

        return (
            <Card style={[styles.medicationCard, { borderLeftColor: medication.color }]}>
                <CardContent>
                    <View style={styles.medicationRow}>
                        <TouchableOpacity
                            style={styles.checkButton}
                            onPress={() => toggleMedicationTaken(item.medicationId, item.time)}
                        >
                            <View style={[
                                styles.checkbox,
                                item.taken && styles.checkedBox
                            ]}>
                                {item.taken && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        </TouchableOpacity>

                        <View style={styles.medicationInfo}>
                            <Text style={[
                                styles.medicationName,
                                item.taken && styles.strikethrough
                            ]}>
                                {medication.name}
                            </Text>
                            <Text style={[
                                styles.medicationDosage,
                                item.taken && styles.takenText
                            ]}>
                                {medication.dosage}
                            </Text>
                            {item.taken && item.takenAt && (
                                <Text style={styles.takenTime}>
                                    Tomado a las {item.takenAt}
                                </Text>
                            )}
                        </View>

                        <View style={styles.timeContainer}>
                            <Text style={[
                                styles.timeText,
                                item.taken && styles.takenText
                            ]}>
                                {item.time}
                            </Text>
                        </View>
                    </View>
                </CardContent>
            </Card>
        );
    };

    const renderEmptyState = () => (
        <Card>
            <CardContent style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💊</Text>
                <Text style={styles.emptyTitle}>
                    No hay medicamentos programados para hoy
                </Text>
                <Text style={styles.emptySubtitle}>
                    Agrega medicamentos para comenzar
                </Text>
                <Button
                    title="Agregar medicamento"
                    onPress={onAddMedication}
                    style={styles.emptyButton}
                />
            </CardContent>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress Card */}
            <Card style={styles.progressCard}>
                <CardHeader>
                    <CardTitle>Progreso de Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                    <View style={styles.progressRow}>
                        <View>
                            <Text style={styles.progressNumber}>
                                {progress.taken}/{progress.total}
                            </Text>
                            <Text style={styles.progressLabel}>
                                Medicamentos tomados
                            </Text>
                        </View>
                        <View style={styles.progressRight}>
                            <Text style={styles.progressPercentage}>
                                {progress.percentage.toFixed(0)}%
                            </Text>
                            <Text style={styles.progressLabel}>
                                Completado
                            </Text>
                        </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${progress.percentage}%` }
                            ]}
                        />
                    </View>
                </CardContent>
            </Card>

            {/* Today's Schedule */}
            <View style={styles.scheduleHeader}>
                <Text style={styles.scheduleTitle}>Horario de Hoy</Text>
                <Text style={styles.scheduleDate}>
                    {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>
            </View>

            <FlatList
                data={dailySchedule}
                renderItem={renderMedicationItem}
                keyExtractor={(item, index) => `${item.medicationId}-${item.time}-${index}`}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    progressCard: {
        margin: 16,
        marginBottom: 8,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressRight: {
        alignItems: 'flex-end',
    },
    progressNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10B981',
    },
    progressPercentage: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    progressLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginTop: 16,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    scheduleTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    scheduleDate: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContainer: {
        padding: 16,
        paddingTop: 0,
    },
    medicationCard: {
        marginBottom: 8,
        borderLeftWidth: 4,
    },
    medicationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkButton: {
        marginRight: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedBox: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    checkmark: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    medicationInfo: {
        flex: 1,
    },
    medicationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    medicationDosage: {
        fontSize: 14,
        color: '#6B7280',
    },
    strikethrough: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    takenText: {
        color: '#9CA3AF',
    },
    takenTime: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 2,
    },
    timeContainer: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        minWidth: 200,
    },
});
