import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Medication } from '../types';

interface AddMedicationScreenProps {
    onSave: (medication: Omit<Medication, 'id' | 'color'>) => void;
    onCancel: () => void;
}

const frequencies = [
    'Una vez al día',
    'Dos veces al día',
    'Tres veces al día',
    'Cuatro veces al día',
    'Cada 8 horas',
    'Cada 12 horas',
    'Según necesidad',
];

export const AddMedicationScreen: React.FC<AddMedicationScreenProps> = ({
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('');
    const [times, setTimes] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [newTime, setNewTime] = useState('');

    const addTime = () => {
        if (newTime && !times.includes(newTime)) {
            setTimes([...times, newTime].sort());
            setNewTime('');
        }
    };

    const removeTime = (timeToRemove: string) => {
        setTimes(times.filter(time => time !== timeToRemove));
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Por favor ingresa el nombre del medicamento');
            return;
        }
        if (!dosage.trim()) {
            Alert.alert('Error', 'Por favor ingresa la dosis');
            return;
        }
        if (!frequency) {
            Alert.alert('Error', 'Por favor selecciona la frecuencia');
            return;
        }
        if (times.length === 0) {
            Alert.alert('Error', 'Por favor agrega al menos un horario');
            return;
        }

        onSave({
            name: name.trim(),
            dosage: dosage.trim(),
            frequency,
            times,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card>
                    <CardHeader>
                        <CardTitle>Agregar Nuevo Medicamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Nombre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre del Medicamento *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="ej. Ibuprofeno"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Dosis */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dosis *</Text>
                            <TextInput
                                style={styles.input}
                                value={dosage}
                                onChangeText={setDosage}
                                placeholder="ej. 400mg"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Frecuencia */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Frecuencia *</Text>
                            <View style={styles.frequencyContainer}>
                                {frequencies.map((freq) => (
                                    <TouchableOpacity
                                        key={freq}
                                        style={[
                                            styles.frequencyOption,
                                            frequency === freq && styles.frequencySelected,
                                        ]}
                                        onPress={() => setFrequency(freq)}
                                    >
                                        <Text
                                            style={[
                                                styles.frequencyText,
                                                frequency === freq && styles.frequencySelectedText,
                                            ]}
                                        >
                                            {freq}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Horarios */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Horarios *</Text>
                            <View style={styles.timeInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.timeInput]}
                                    value={newTime}
                                    onChangeText={setNewTime}
                                    placeholder="00:00"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={5}
                                />
                                <Button
                                    title="+"
                                    onPress={addTime}
                                    variant="outline"
                                    style={styles.addTimeButton}
                                />
                            </View>
                            <View style={styles.timesContainer}>
                                {times.map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={styles.timeChip}
                                        onPress={() => removeTime(time)}
                                    >
                                        <Text style={styles.timeChipText}>{time} ×</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Notas */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notas (opcional)</Text>
                            <TextInput
                                style={[styles.input, styles.notesInput]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="ej. Tomar con comida"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </CardContent>
                </Card>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Cancelar"
                        onPress={onCancel}
                        variant="secondary"
                        style={styles.cancelButton}
                    />
                    <Button
                        title="Agregar Medicamento"
                        onPress={handleSubmit}
                        style={styles.saveButton}
                        disabled={!name || !dosage || !frequency || times.length === 0}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
    },
    notesInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    frequencyContainer: {
        gap: 8,
    },
    frequencyOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    frequencySelected: {
        backgroundColor: '#EBF4FF',
        borderColor: '#3B82F6',
    },
    frequencyText: {
        fontSize: 14,
        color: '#6B7280',
    },
    frequencySelectedText: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    timeInputContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    timeInput: {
        flex: 1,
    },
    addTimeButton: {
        minWidth: 48,
        paddingHorizontal: 0,
    },
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    timeChip: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeChipText: {
        fontSize: 14,
        color: '#6B7280',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 2,
    },
});
