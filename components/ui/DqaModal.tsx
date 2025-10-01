import React from 'react';
import Modal from './Modal';
import Button from './Button';
import type { DqaState } from '../../types';

interface DqaModalProps {
  isOpen: boolean;
  onClose: () => void;
  dqaState: DqaState;
  setDqaState: React.Dispatch<React.SetStateAction<DqaState>>;
}

const DqaSlider: React.FC<{
  label: string;
  description: string;
  name: keyof DqaState;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, description, name, value, onChange }) => (
    <div>
        <div className="flex justify-between items-center">
            <label htmlFor={name} className="font-semibold text-gray-700">{label}</label>
            <span className="px-2 py-0.5 text-sm font-bold bg-[var(--color-brand-accent)]/20 text-[var(--color-brand-primary)] rounded-md">{value}</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">{description}</p>
        <input
            type="range"
            id={name}
            name={name}
            min="1"
            max="5"
            step="1"
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand-primary)]"
        />
    </div>
);


const DqaModal: React.FC<DqaModalProps> = ({ isOpen, onClose, dqaState, setDqaState }) => {
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDqaState(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    };

    const dqaFields = [
        { name: 'reliability', label: 'Reliability', description: 'Source verification, measurement method' },
        { name: 'completeness', label: 'Completeness', description: 'Represents the full process chain' },
        { name: 'temporal', label: 'Temporal Correlation', description: 'How old is the data?' },
        { name: 'geographical', label: 'Geographical Correlation', description: 'Data represents the correct region' },
        { name: 'technological', label: 'Technological Correlation', description: 'Data represents the correct technology' },
    ];
    
    const adqi = (Object.values(dqaState).reduce((a, b) => a + b, 0) / Object.keys(dqaState).length).toFixed(2);

    return (
        <Modal title="Data Quality Assessment (Pedigree Matrix)" onClose={onClose}>
            <div className="space-y-6">
                <p className="text-sm text-gray-600">
                    Rate the quality of your input data based on the Pedigree Matrix criteria (ISO 14044). A score of 1 is worst, 5 is best.
                </p>
                
                {dqaFields.map(field => (
                    <DqaSlider
                        key={field.name}
                        label={field.label}
                        description={field.description}
                        name={field.name as keyof DqaState}
                        value={dqaState[field.name as keyof DqaState]}
                        onChange={handleChange}
                    />
                ))}

                <div className="pt-4 border-t text-center">
                    <p className="text-sm text-gray-500">Aggregated Data Quality Indicator (ADQI)</p>
                    <p className="text-3xl font-bold text-gray-800">{adqi}</p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>Save & Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default DqaModal;
