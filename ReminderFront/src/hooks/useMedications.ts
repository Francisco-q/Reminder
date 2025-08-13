import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { medicationService } from '../services';
import type { Medication } from '../types';

export const useMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchMedications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await medicationService.getMedications();
      setMedications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const createMedication = async (medicationData: any) => {
    try {
      const newMedication = await medicationService.createMedication(medicationData);
      setMedications(prev => [...prev, newMedication]);
      return newMedication;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear medicamento';
      setError(errorMessage);
      throw err;
    }
  };

  const updateMedication = async (id: string, medicationData: any) => {
    try {
      const updatedMedication = await medicationService.updateMedication(id, medicationData);
      setMedications(prev =>
        prev.map(med => med.id === id ? updatedMedication : med)
      );
      return updatedMedication;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar medicamento';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      await medicationService.deleteMedication(id);
      setMedications(prev => prev.filter(med => med.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar medicamento';
      setError(errorMessage);
      throw err;
    }
  };

  const updateStock = async (id: string, newStock: number, notes?: string) => {
    try {
      const updatedMedication = await medicationService.updateStock(id, newStock, notes);
      setMedications(prev =>
        prev.map(med => med.id === id ? updatedMedication : med)
      );
      return updatedMedication;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar stock';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [isAuthenticated]);

  return {
    medications,
    loading,
    error,
    refetch: fetchMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    updateStock,
    clearError: () => setError(null),
  };
};

export const useMedication = (id: string | null) => {
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMedication = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await medicationService.getMedicationById(id);
        setMedication(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar medicamento');
      } finally {
        setLoading(false);
      }
    };

    fetchMedication();
  }, [id]);

  return {
    medication,
    loading,
    error,
    clearError: () => setError(null),
  };
};

export const useLowStockMedications = () => {
  const [lowStockMedications, setLowStockMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchLowStockMedications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await medicationService.getLowStockMedications();
      setLowStockMedications(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar medicamentos con stock bajo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockMedications();
  }, [isAuthenticated]);

  return {
    lowStockMedications,
    loading,
    error,
    refetch: fetchLowStockMedications,
    clearError: () => setError(null),
  };
};
