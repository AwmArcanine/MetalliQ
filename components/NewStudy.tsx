import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { LcaInputData, LcaReport, User, TransportationStage, FuelType, PowerSource, NewStudyFormState, DqaState } from '../types';
import { getLcaAnalysis, getTransportAIOptimization } from '../services/geminiService';
// FIX: Import GRID_MIXES constant
import { GRID_MIXES } from '../services/lcaFormulas';
import { SparklesIcon, PlusCircleIcon, DocumentTextIcon, InformationCircleIcon, ShieldCheckIcon, ExclamationTriangleIcon, ALL_METALS } from '../constants';
import AILoadingAnimation from './ui/AILoadingAnimation';
import DqaModal from './ui/DqaModal';

interface NewStudyProps {
  onAnalysisComplete: (report: LcaReport) => void;
  currentUser: User;
  workspaceId: string;
  formData: NewStudyFormState;
  setFormData: React.Dispatch<React.SetStateAction<NewStudyFormState>>;
}

const AUTOFILL_SUGGESTIONS = {
  'Structural': { usePhase: '75 years', endOfLife: '90% Recycled' },
  'Automotive': { usePhase: '15 years', endOfLife: '75% Recycled' },
  'Electronics': { usePhase: '5 years', endOfLife: '40% Recycled' },
  'Aerospace': { usePhase: '25 years', endOfLife: '15% Recycled' },
  'Alloying Additive': { usePhase: '50 years', endOfLife: '85% Recycled' },
  'Batteries': { usePhase: '8 years', endOfLife: '95% Recycled' },
  'Catalysts': { usePhase: '3 years', endOfLife: '98% Recycled' },
  'Medical Devices': { usePhase: '10 years', endOfLife: '10% Recycled' },
  'Nuclear Applications': { usePhase: '60 years', endOfLife: '5% Recycled' },
  'Packaging': { usePhase: '1 year', endOfLife: '60% Recycled' },
  'Renewable Energy': { usePhase: '30 years', endOfLife: '80% Recycled' },
  'General Purpose': { usePhase: '10 years', endOfLife: '50% Recycled' },
};

const REGION_AUTOFILL_SUGGESTIONS = {
    // Iron Ore
    'India - Odisha (Keonjhar, Sundargarh)': { oreType: 'Hematite/Goethite', oreConcentration: '62' },
    'India - Chhattisgarh (Bailadila)': { oreType: 'Hematite (High-Grade)', oreConcentration: '66' },
    'India - Jharkhand (Singhbhum)': { oreType: 'Hematite', oreConcentration: '60' },
    'India - Karnataka (Bellary-Hospet)': { oreType: 'Hematite', oreConcentration: '58' },
    // Bauxite (Aluminum)
    'India - Odisha (Koraput, Kalahandi)': { oreType: 'Gibbsite Bauxite', oreConcentration: '45' },
    'India - Gujarat (Jamnagar)': { oreType: 'Bauxite', oreConcentration: '50' },
    'India - Jharkhand (Lohardaga)': { oreType: 'Bauxite', oreConcentration: '48' },
    // Copper
    'India - Rajasthan (Khetri Belt)': { oreType: 'Chalcopyrite', oreConcentration: '0.9' },
    'India - Madhya Pradesh (Malanjkhand)': { oreType: 'Chalcopyrite', oreConcentration: '1.1' },
    // Gold
    'India - Karnataka (Kolar Gold Fields)': { oreType: 'Quartz Veins', oreConcentration: '0.0004' },
    // Coal
    'India - Jharkhand (Jharia, Bokaro)': { oreType: 'Bituminous Coal', oreConcentration: 'N/A' },
    'India - Odisha (Talcher)': { oreType: 'Sub-bituminous Coal', oreConcentration: 'N/A' },
    // Limestone
    'India - Andhra Pradesh (Kadapa, Kurnool)': { oreType: 'Limestone', oreConcentration: '95' },
    'India - Rajasthan (Chittorgarh)': { oreType: 'Limestone', oreConcentration: '96' },
    // New Global Regions
    'Australia - Western Australia (Greenbushes)': { oreType: 'Spodumene', oreConcentration: '2.0' }, // Lithium
    'Chile - Salar de Atacama': { oreType: 'Lithium Brine', oreConcentration: '0.15' }, // Lithium
    'Canada - Ontario (Sudbury Basin)': { oreType: 'Pentlandite', oreConcentration: '1.2' }, // Nickel
    'Russia - Norilsk': { oreType: 'Pentlandite', oreConcentration: '1.5' }, // Nickel, Palladium
    'DRC - Katanga': { oreType: 'Heterogenite', oreConcentration: '2.5' }, // Cobalt
    'USA - Alaska (Red Dog Mine)': { oreType: 'Sphalerite', oreConcentration: '16' }, // Zinc
};


const baseInputStyles = "block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)] focus:border-[var(--color-brand-accent)] sm:text-sm transition-colors duration-200";
const invalidInputStyles = "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500";

const InputField: React.FC<{label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, isHighlighted?: boolean, placeholder?: string, step?: string, error?: string}> = ({label, name, value, onChange, type="text", isHighlighted = false, placeholder, step, error}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-[var(--text-on-light-primary)]">{label}</label>
    <input type={type} name={name} id={name} value={value} onChange={onChange} className={`${baseInputStyles} mt-1 ${isHighlighted ? 'ring-2 ring-[var(--color-brand-accent)]' : ''} ${error ? invalidInputStyles : ''}`} placeholder={placeholder} step={step} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const SelectField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, isHighlighted?: boolean, error?: string}> = ({label, name, value, onChange, children, isHighlighted = false, error}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-[var(--text-on-light-primary)]">{label}</label>
    <select id={name} name={name} value={value} onChange={onChange} className={`${baseInputStyles} mt-1 ${isHighlighted ? 'ring-2 ring-[var(--color-brand-accent)]' : ''} ${error ? invalidInputStyles : ''}`}>
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const TextareaField: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number, placeholder?: string, error?: string}> = ({label, name, value, onChange, rows = 3, placeholder, error}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-[var(--text-on-light-primary)]">{label}</label>
        <textarea name={name} id={name} value={value} onChange={onChange} rows={rows} className={`${baseInputStyles} mt-1 ${error ? invalidInputStyles : ''}`} placeholder={placeholder} />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);


const NewStudy: React.FC<NewStudyProps> = ({ onAnalysisComplete, currentUser, workspaceId, formData, setFormData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [transportSuggestions, setTransportSuggestions] = useState<string[]>([]);
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  const [isDqaModalOpen, setIsDqaModalOpen] = useState(false);
  const [dqaState, setDqaState] = useState<DqaState>({ reliability: 4, completeness: 4, temporal: 4, geographical: 4, technological: 4 });
  const [errors, setErrors] = useState<Partial<Record<keyof NewStudyFormState | 'transportation', string>>>({});

  const validateForm = useCallback((data: NewStudyFormState): boolean => {
      const newErrors: typeof errors = {};
      
      if (!data.projectName.trim()) newErrors.projectName = "Project name is required.";
      if (!data.material.trim()) newErrors.material = "Material is required.";
      if (!data.category.trim()) newErrors.category = "Category is required.";
      if (!data.functionalUnit.trim()) newErrors.functionalUnit = "Functional unit is required.";
      if (!data.usePhase.trim()) newErrors.usePhase = "Use phase is required.";
      if (!data.endOfLife.trim()) newErrors.endOfLife = "End of life scenario is required.";
      if (!data.region.trim()) newErrors.region = "Analysis region is required.";
      if (!data.intendedApplication.trim()) newErrors.intendedApplication = "Intended application is required.";
      if (!data.intendedAudience.trim()) newErrors.intendedAudience = "Intended audience is required.";
      if (!data.limitations.trim()) newErrors.limitations = "Study limitations are required.";

      const checkNumericRange = (field: keyof NewStudyFormState, name: string, min: number, max: number) => {
        const value = Number(data[field]);
        if (data[field] === '' || data[field] === null) {
            newErrors[field] = `${name} is required.`;
        } else if (isNaN(value) || value < min || value > max) {
            newErrors[field] = `${name} must be a number between ${min} and ${max}.`;
        }
      };

      checkNumericRange('secondaryMaterialContent', 'Secondary material content', 0, 100);
      checkNumericRange('processEnergyEfficiency', 'Process energy efficiency', 0, 100);
      
      if (isNaN(Number(formData.productLifetimeExtensionPotential)) || Number(formData.productLifetimeExtensionPotential) < 0) {
        newErrors.productLifetimeExtensionPotential = "Product life extension must be a positive number.";
      }
      
      if (data.oreConcentration && (isNaN(Number(data.oreConcentration)) || Number(data.oreConcentration) < 0 || Number(data.oreConcentration) > 100)) {
          newErrors.oreConcentration = "Ore concentration must be a number between 0 and 100.";
      }
      
      let transportError = false;
      data.transportationStages.forEach((stage) => {
          if (!stage.name.trim() || !stage.distance.trim() || isNaN(Number(stage.distance)) || Number(stage.distance) <= 0) {
              transportError = true;
          }
      });

      if (transportError) newErrors.transportation = "All transportation stages must have a name and a valid, positive distance.";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setFormData(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'productionProcess') {
            newState.secondaryMaterialContent = value === 'recycled' ? '90' : '10';
        }
        return newState;
    });
  };
  
  const handleAutofill = (source: 'category' | 'region', value: string) => {
      let fieldsToUpdate: Partial<NewStudyFormState> = {};
      let highlightKeys: string[] = [];

      if (source === 'category' && value in AUTOFILL_SUGGESTIONS) {
          fieldsToUpdate = AUTOFILL_SUGGESTIONS[value as keyof typeof AUTOFILL_SUGGESTIONS];
          highlightKeys = Object.keys(fieldsToUpdate);
      } else if (source === 'region' && value in REGION_AUTOFILL_SUGGESTIONS) {
          fieldsToUpdate = REGION_AUTOFILL_SUGGESTIONS[value as keyof typeof REGION_AUTOFILL_SUGGESTIONS];
          highlightKeys = Object.keys(fieldsToUpdate);
      }
      
      if (Object.keys(fieldsToUpdate).length > 0) {
          setFormData(prev => ({ ...prev, ...fieldsToUpdate }));
          setHighlightedFields(highlightKeys);
          setTimeout(() => setHighlightedFields([]), 2000);
      }
  };

  useEffect(() => {
    if (formData.category) handleAutofill('category', formData.category);
  }, [formData.category]);

  useEffect(() => {
    if (formData.region) handleAutofill('region', formData.region);
  }, [formData.region]);
  
  const handleTransportChange = (id: number, field: keyof TransportationStage, value: string) => {
    if (errors.transportation) {
        setErrors(prev => ({ ...prev, transportation: undefined }));
    }
    setFormData(prev => ({
        ...prev,
        transportationStages: prev.transportationStages.map(stage =>
            stage.id === id ? { ...stage, [field]: value } : stage
        )
    }));
  };

  const addTransportStage = () => {
    setFormData(prev => ({
        ...prev,
        transportationStages: [...prev.transportationStages, { id: Date.now(), name: '', mode: 'Truck', distance: '100', fuelType: 'Diesel' }]
    }));
  };

  const removeTransportStage = (id: number) => {
    setFormData(prev => ({
        ...prev,
        transportationStages: prev.transportationStages.filter(stage => stage.id !== id)
    }));
  };

  const fetchOptimizationSuggestion = useCallback(async () => {
    if (formData.transportationStages.length === 0) return;
    setFetchingSuggestions(true);
    setTransportSuggestions([]);
    try {
        const stagesToOptimize = formData.transportationStages.map(({ id, name, ...rest }) => ({
            ...rest,
            distance: parseFloat(rest.distance) || 0,
        }));
        const suggestions = await getTransportAIOptimization(stagesToOptimize);
        setTransportSuggestions(suggestions);
    } catch (error: any) {
        console.error("Failed to get AI transport suggestions:", error);
        const errorMessage = `AI suggestion failed: ${error.message || 'Please check your connection or API key.'}`;
        setTransportSuggestions(formData.transportationStages.map(() => errorMessage));
    } finally {
        setFetchingSuggestions(false);
    }
  }, [formData.transportationStages]);


  const handleRunAnalysis = async () => {
    if (!validateForm(formData)) return;

    setIsLoading(true);
    setAnalysisError(null);
    
    // Convert form state strings to numbers for the API
    const finalInputs: LcaInputData = {
        ...formData,
        ...dqaState,
        secondaryMaterialContent: parseFloat(formData.secondaryMaterialContent),
        processEnergyEfficiency: parseFloat(formData.processEnergyEfficiency),
        productLifetimeExtensionPotential: parseFloat(formData.productLifetimeExtensionPotential),
        oreConcentration: formData.oreConcentration ? parseFloat(formData.oreConcentration) : undefined,
        transportationStages: formData.transportationStages.map(t => ({...t, distance: parseFloat(t.distance)})),
        systemBoundary: [formData.systemBoundary],
        // DQA and uncertainty are hardcoded for now
        adqi: (Object.values(dqaState).reduce((a, b) => a + b, 0) / Object.keys(dqaState).length),
        uncertaintyDeviation: 14, // From video
    };

    try {
      const report = await getLcaAnalysis(finalInputs, currentUser, workspaceId);
      onAnalysisComplete(report);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      let message = 'An unexpected error occurred during analysis.';
      if (error.message && error.message.includes('API_KEY')) {
        message = 'AI analysis failed: The API key is missing or invalid. Please contact an administrator.';
      }
      setAnalysisError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormValid = Object.keys(errors).length === 0;
  
  const adqi = useMemo(() => {
    return (Object.values(dqaState).reduce((a, b) => a + b, 0) / Object.keys(dqaState).length).toFixed(2);
  }, [dqaState]);


  if (isLoading) {
    return <AILoadingAnimation />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-on-light-primary)]">Start a New LCA Study</h1>
        <p className="text-[var(--text-on-light-secondary)] mt-1">Fill in the details below to run a comprehensive environmental analysis.</p>
      </div>
      
      {analysisError && <Card className="bg-red-50 border border-red-200 text-red-800"><p>{analysisError}</p></Card>}

      <Card>
          <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4 flex items-center"><InformationCircleIcon className="w-5 h-5 mr-2" /> 1. Goal & Scope Definition (ISO 14044)</h2>
          <div className="space-y-4">
              <TextareaField label="Intended Application" name="intendedApplication" value={formData.intendedApplication} onChange={handleChange} error={errors.intendedApplication} />
              <TextareaField label="Intended Audience" name="intendedAudience" value={formData.intendedAudience} onChange={handleChange} error={errors.intendedAudience} />
              <TextareaField label="Study Limitations" name="limitations" value={formData.limitations} onChange={handleChange} error={errors.limitations} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <SelectField label="System Boundary" name="systemBoundary" value={formData.systemBoundary} onChange={handleChange}>
                      <option>Cradle-to-Grave</option>
                      <option>Cradle-to-Gate</option>
                      <option>Gate-to-Gate</option>
                  </SelectField>
                  <div className="flex items-center pt-6">
                      <input type="checkbox" id="isComparativeAssertion" name="isComparativeAssertion" checked={formData.isComparativeAssertion} onChange={e => setFormData(p => ({...p, isComparativeAssertion: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]" />
                      <label htmlFor="isComparativeAssertion" className="ml-2 block text-sm text-gray-900">This is a comparative assertion for public disclosure.</label>
                  </div>
              </div>
          </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">2. Project & Material</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Project Name" name="projectName" value={formData.projectName} onChange={handleChange} error={errors.projectName} />
          <SelectField label="Material" name="material" value={formData.material} onChange={handleChange} error={errors.material}>
              {ALL_METALS.map(metal => <option key={metal} value={metal}>{metal}</option>)}
          </SelectField>
          <SelectField label="Category / Application" name="category" value={formData.category} onChange={handleChange} error={errors.category}>
              <option value="">Select Category...</option>
              {Object.keys(AUTOFILL_SUGGESTIONS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </SelectField>
           <SelectField label="Analysis Region" name="region" value={formData.region} onChange={handleChange} error={errors.region}>
              {Object.keys(REGION_AUTOFILL_SUGGESTIONS).map(region => <option key={region} value={region}>{region}</option>)}
           </SelectField>
          <InputField label="Metal Ore Concentration (%) (Optional)" name="oreConcentration" type="number" value={formData.oreConcentration} onChange={handleChange} isHighlighted={highlightedFields.includes('oreConcentration')} placeholder="Leave blank for AI estimate" error={errors.oreConcentration} />
          <InputField label="Type of Ore (Optional)" name="oreType" value={formData.oreType} onChange={handleChange} isHighlighted={highlightedFields.includes('oreType')} placeholder="e.g., Hematite" />
           <SelectField label="Alloy Complexity" name="alloyComplexity" value={formData.alloyComplexity} onChange={handleChange}>
            <option value="simple">Simple (e.g., pure metal, binary alloy)</option>
            <option value="complex">Complex (e.g., superalloys, multi-element)</option>
          </SelectField>
          <SelectField label="Coatings / Additives" name="coatingsAndAdditives" value={formData.coatingsAndAdditives} onChange={handleChange}>
            <option value="none">None</option>
            <option value="galvanized">Galvanized (Zinc)</option>
            <option value="polymer">Polymer Coating</option>
          </SelectField>
        </div>
      </Card>
      
      <Card>
          <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4 flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-2" /> 3. Data Quality Assessment & Uncertainty (Pedigree Matrix)</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                  <p className="font-semibold text-gray-800">Set Data Quality Scores</p>
                  <p className="text-sm text-gray-600">Rate your data's reliability, completeness, and correlation.</p>
              </div>
              <div className="text-center">
                  <Button variant="secondary" onClick={() => setIsDqaModalOpen(true)}>Set Scores</Button>
                  <p className="text-xs text-gray-500 mt-1">ADQI: <span className="font-bold">{adqi}</span></p>
              </div>
          </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">4. Lifecycle Stages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Functional Unit" name="functionalUnit" value={formData.functionalUnit} onChange={handleChange} isHighlighted={highlightedFields.includes('functionalUnit')} error={errors.functionalUnit} />
          <SelectField label="Production Process" name="productionProcess" value={formData.productionProcess} onChange={handleChange}>
            <option value="primary">Primary Route (e.g., BF-BOF)</option>
            <option value="recycled">Recycled Route (e.g., EAF)</option>
          </SelectField>
          <InputField label="Secondary Material Content (%)" name="secondaryMaterialContent" type="number" value={formData.secondaryMaterialContent} onChange={handleChange} error={errors.secondaryMaterialContent} />
          <InputField label="Use Phase Duration" name="usePhase" value={formData.usePhase} onChange={handleChange} isHighlighted={highlightedFields.includes('usePhase')} error={errors.usePhase} />
          <InputField label="End of Life Scenario" name="endOfLife" value={formData.endOfLife} onChange={handleChange} isHighlighted={highlightedFields.includes('endOfLife')} error={errors.endOfLife} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">5. Transportation Stages</h2>
        <div className="space-y-4">
          {formData.transportationStages.map((stage, index) => (
            <div key={stage.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 bg-gray-50 border rounded-lg">
                <div className="md:col-span-3"><InputField label="Stage Name" name="name" value={stage.name} onChange={(e) => handleTransportChange(stage.id, 'name', e.target.value)} /></div>
                <div className="md:col-span-2"><SelectField label="Mode" name="mode" value={stage.mode} onChange={(e) => handleTransportChange(stage.id, 'mode', e.target.value)}><option>Truck</option><option>Train</option><option>Ship</option><option>Air</option></SelectField></div>
                <div className="md:col-span-2"><InputField label="Distance (km)" name="distance" type="number" value={stage.distance} onChange={(e) => handleTransportChange(stage.id, 'distance', e.target.value)} /></div>
                <div className="md:col-span-2"><SelectField label="Fuel" name="fuelType" value={stage.fuelType} onChange={(e) => handleTransportChange(stage.id, 'fuelType', e.target.value as FuelType)}><option>Diesel</option><option>Petrol</option><option>Electric</option><option>Marine Fuel</option><option>Jet Fuel</option></SelectField></div>
                {stage.fuelType === 'Electric' && <div className="md:col-span-2"><SelectField label="Power Source" name="powerSource" value={stage.powerSource || 'Grid'} onChange={(e) => handleTransportChange(stage.id, 'powerSource', e.target.value as PowerSource)}><option>Grid</option><option>Solar</option><option>Wind</option><option>Mixed Renewables</option></SelectField></div>}
                <div className="md:col-span-1"><Button variant="ghost" className="w-full text-red-500 hover:bg-red-100" onClick={() => removeTransportStage(stage.id)}>Remove</Button></div>
                {transportSuggestions[index] && <div className="md:col-span-12 mt-2 p-2 text-xs bg-blue-50 border-l-4 border-blue-400 text-blue-800">{transportSuggestions[index]}</div>}
            </div>
          ))}
          {errors.transportation && <p className="mt-1 text-xs text-red-600">{errors.transportation}</p>}
        </div>
        <div className="mt-4 flex items-center space-x-4">
            <Button variant="secondary" onClick={addTransportStage} leftIcon={<PlusCircleIcon className="w-4 h-4" />}>Add Transport Stage</Button>
            <Button variant="ghost" onClick={fetchOptimizationSuggestion} disabled={fetchingSuggestions} leftIcon={<SparklesIcon className="w-4 h-4"/>}>
                {fetchingSuggestions ? 'Getting Suggestions...' : 'Get AI Suggestions'}
            </Button>
        </div>
      </Card>
        
        <Card>
            <h2 className="text-lg font-semibold text-[var(--text-on-light-primary)] mb-4">6. Advanced Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <SelectField label="Grid Electricity Mix" name="gridElectricityMix" value={formData.gridElectricityMix} onChange={handleChange}>
                    {Object.keys(GRID_MIXES).map(mix => <option key={mix} value={mix}>{mix}</option>)}
                </SelectField>
                <SelectField label="Water Source" name="waterSourceType" value={formData.waterSourceType} onChange={handleChange}>
                    <option>Surface</option>
                    <option>Groundwater</option>
                    <option>Desalinated</option>
                </SelectField>
                <InputField label="Process Energy Efficiency (%)" name="processEnergyEfficiency" type="number" value={formData.processEnergyEfficiency} onChange={handleChange} error={errors.processEnergyEfficiency}/>
                <SelectField label="Waste Treatment Method" name="wasteTreatmentMethod" value={formData.wasteTreatmentMethod} onChange={handleChange}>
                    <option>Controlled Landfill</option>
                    <option>Incineration</option>
                    <option>Open Dump</option>
                </SelectField>
                <InputField label="Product Life Extension (Years)" name="productLifetimeExtensionPotential" type="number" value={formData.productLifetimeExtensionPotential} onChange={handleChange} placeholder="e.g., 5" error={errors.productLifetimeExtensionPotential}/>
            </div>
        </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleRunAnalysis} size="lg" disabled={!isFormValid}>Run Analysis</Button>
      </div>
      
      <DqaModal 
        isOpen={isDqaModalOpen}
        onClose={() => setIsDqaModalOpen(false)}
        dqaState={dqaState}
        setDqaState={setDqaState}
      />

    </div>
  );
};

export default NewStudy;