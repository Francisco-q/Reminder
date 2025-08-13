import React from 'react';
import { useParams } from 'react-router-dom';

const MedicationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Editar Medicamento' : 'Nuevo Medicamento'}
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Formulario de {isEdit ? 'edición' : 'creación'} de medicamento en construcción...
        </p>
      </div>
    </div>
  );
};

export default MedicationForm;
