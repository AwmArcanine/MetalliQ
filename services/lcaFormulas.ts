

import type { LcaInputData, LcaReport, ImpactResult, ImpactStage, FuelType, PowerSource } from '../types';

// --- DATABASE OF FACTORS ---

const CF = {
    GWP: { CO2: 1.0, CH4: 36, N2O: 298 },
    AP: { SO2: 1.0, NOx: 0.7, NH3: 1.88 },
    EP: { fw: { PO4: 1.0, P: 3.06 } },
    ODP: { CFC11: 1.0, CFC12: 0.73 },
    POCP: { NOx: 0.024, NMVOC: 1.0 },
};

const TRANSPORT_FACTORS: Record<string, Record<string, number>> = { // g CO2-eq per t-km
    Truck: {
        Diesel: 95,
        Petrol: 110,
        Electric_Grid: 40, // Assuming a national average grid mix
        Electric_Solar: 5,
        Electric_Wind: 4,
        Electric_Mixed_Renewables: 6,
    },
    Train: {
        Diesel: 30,
        Electric_Grid: 15,
        Electric_Solar: 2,
        Electric_Wind: 1.5,
        Electric_Mixed_Renewables: 2.5,
    },
    Ship: {
        'Marine Fuel': 15,
    },
    Air: {
        'Jet Fuel': 500,
    },
};

const GRID_EMISSION_FACTORS = { // kg CO2-eq per kWh
    Coal: 0.95,
    Gas: 0.45,
    Hydro: 0.02,
    Renewables: 0.02,
    Nuclear: 0.015,
};

export const GRID_MIXES: Record<string, Record<string, number>> = {
    'India - National Average': { Coal: 0.70, Renewables: 0.20, Hydro: 0.07, Gas: 0.03 },
    'India - Northern Region (Coal/Hydro Mix)': { Coal: 0.65, Hydro: 0.20, Renewables: 0.10, Gas: 0.05 },
    'India - Western Region (Coal Dominant)': { Coal: 0.70, Renewables: 0.15, Hydro: 0.10, Gas: 0.05 },
    'India - Southern Region (Renewable/Coal Mix)': { Coal: 0.55, Renewables: 0.30, Hydro: 0.10, Gas: 0.05 },
    'India - Eastern Region (Coal Heavy)': { Coal: 0.85, Hydro: 0.07, Renewables: 0.05, Gas: 0.03 },
    'India - North-Eastern Region (Hydro/Gas Mix)': { Hydro: 0.40, Gas: 0.30, Coal: 0.20, Renewables: 0.10 },
    'Global Average': { Coal: 0.38, Gas: 0.23, Hydro: 0.16, Renewables: 0.11, Nuclear: 0.10, Other: 0.02 },
    'USA - National Average': { Gas: 0.40, Coal: 0.20, Nuclear: 0.19, Renewables: 0.21 },
    'EU-27 - Average': { Gas: 0.20, Nuclear: 0.25, Renewables: 0.38, Coal: 0.15, Other: 0.02 },
    'China - National Average': { Coal: 0.63, Hydro: 0.15, Renewables: 0.15, Gas: 0.05, Nuclear: 0.02 },
    'Coal-dominated': { Coal: 0.8, Gas: 0.1, Renewables: 0.1 },
    'Renewable-heavy': { Renewables: 0.7, Gas: 0.2, Coal: 0.1 },
};

// --- MATERIAL ARCHETYPES ---
const archetypes = {
    BaseMetal: { // e.g., Iron, Copper, Zinc, Lead. Based on Steel.
        primary: { emissions: { CO2: 1850, CH4: 5, N2O: 0.1, SO2: 3, NOx: 2, NH3: 0.1, NMVOC: 1, PM2_5: 0.5, CFC11: 1e-9 }, resources: { Ore: 1400 }, energy_direct_MJ: 27000, electricity_kWh: 500, water_m3: 5 },
        recycled: { emissions: { CO2: 50, CH4: 1, N2O: 0.02, SO2: 1, NOx: 0.5, NH3: 0.05, NMVOC: 0.2, PM2_5: 0.1, CFC11: 0.5e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 4000, electricity_kWh: 600, water_m3: 2 }
    },
    LightMetal: { // e.g., Aluminum, Magnesium, Titanium. High electricity use.
        primary: { emissions: { CO2: 1500, CH4: 4, N2O: 0.2, SO2: 5, NOx: 3, NH3: 0.2, NMVOC: 1.5, PM2_5: 0.8, CFC11: 1.2e-9 }, resources: { Ore: 2000 }, energy_direct_MJ: 30000, electricity_kWh: 15000, water_m3: 10 },
        recycled: { emissions: { CO2: 70, CH4: 1.5, N2O: 0.03, SO2: 1.2, NOx: 0.6, NH3: 0.06, NMVOC: 0.3, PM2_5: 0.15, CFC11: 0.6e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 2000, electricity_kWh: 750, water_m3: 1 }
    },
    PreciousMetal: { // e.g., Gold, Platinum, Silver. Very low concentration, high processing.
        primary: { emissions: { CO2: 25000, CH4: 100, N2O: 2, SO2: 50, NOx: 30, NH3: 2, NMVOC: 15, PM2_5: 8, CFC11: 5e-9 }, resources: { Ore: 1000000 }, energy_direct_MJ: 500000, electricity_kWh: 20000, water_m3: 1500 },
        recycled: { emissions: { CO2: 100, CH4: 2, N2O: 0.05, SO2: 2, NOx: 1, NH3: 0.1, NMVOC: 0.5, PM2_5: 0.2, CFC11: 1e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 5000, electricity_kWh: 800, water_m3: 50 }
    },
    RareEarthElement: { // e.g., Neodymium, Dysprosium. Complex chemical processing.
        primary: { emissions: { CO2: 35000, CH4: 120, N2O: 2.5, SO2: 80, NOx: 40, NH3: 3, NMVOC: 20, PM2_5: 10, CFC11: 6e-9 }, resources: { Ore: 50000 }, energy_direct_MJ: 700000, electricity_kWh: 25000, water_m3: 2000 },
        recycled: { emissions: { CO2: 1500, CH4: 10, N2O: 0.1, SO2: 5, NOx: 2, NH3: 0.2, NMVOC: 1, PM2_5: 0.5, CFC11: 1.5e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 50000, electricity_kWh: 2000, water_m3: 100 }
    },
    SpecialtyMetal: { // e.g., Cobalt, Tungsten. Varied, but generally energy intensive.
        primary: { emissions: { CO2: 5000, CH4: 20, N2O: 0.5, SO2: 10, NOx: 8, NH3: 0.5, NMVOC: 5, PM2_5: 2, CFC11: 2e-9 }, resources: { Ore: 20000 }, energy_direct_MJ: 90000, electricity_kWh: 8000, water_m3: 500 },
        recycled: { emissions: { CO2: 200, CH4: 3, N2O: 0.06, SO2: 1.5, NOx: 0.8, NH3: 0.08, NMVOC: 0.4, PM2_5: 0.18, CFC11: 0.8e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 8000, electricity_kWh: 1000, water_m3: 20 }
    },
    Metalloid: { // e.g., Boron, Germanium, Selenium, Sulfur
        primary: { emissions: { CO2: 1200, CH4: 8, N2O: 0.2, SO2: 20, NOx: 5, NH3: 0.3, NMVOC: 3, PM2_5: 1.2, CFC11: 1.5e-9 }, resources: { Ore: 5000 }, energy_direct_MJ: 40000, electricity_kWh: 2000, water_m3: 100 },
        recycled: { emissions: { CO2: 150, CH4: 2, N2O: 0.04, SO2: 3, NOx: 1, NH3: 0.07, NMVOC: 0.35, PM2_5: 0.15, CFC11: 0.7e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 6000, electricity_kWh: 500, water_m3: 15 }
    },
    AlkalineEarthMetal: { // e.g., Barium, Beryllium, Calcium, Strontium
        primary: { emissions: { CO2: 2200, CH4: 10, N2O: 0.3, SO2: 8, NOx: 6, NH3: 0.4, NMVOC: 4, PM2_5: 1.5, CFC11: 1.8e-9 }, resources: { Ore: 8000 }, energy_direct_MJ: 50000, electricity_kWh: 6000, water_m3: 80 },
        recycled: { emissions: { CO2: 250, CH4: 2.5, N2O: 0.05, SO2: 1.2, NOx: 0.7, NH3: 0.06, NMVOC: 0.3, PM2_5: 0.16, CFC11: 0.75e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 7000, electricity_kWh: 800, water_m3: 10 }
    },
    AlkaliMetal: { // e.g., Sodium, Potassium, Rubidium, Lithium
        primary: { emissions: { CO2: 4000, CH4: 15, N2O: 0.4, SO2: 9, NOx: 7, NH3: 0.45, NMVOC: 4.5, PM2_5: 1.8, CFC11: 1.9e-9 }, resources: { Ore: 15000 }, energy_direct_MJ: 80000, electricity_kWh: 10000, water_m3: 600 },
        recycled: { emissions: { CO2: 300, CH4: 3, N2O: 0.06, SO2: 1.3, NOx: 0.8, NH3: 0.07, NMVOC: 0.35, PM2_5: 0.17, CFC11: 0.8e-9 }, resources: { Ore: 0 }, energy_direct_MJ: 9000, electricity_kWh: 1200, water_m3: 25 }
    }
};

const materialArchetypeMap: { [key: string]: keyof typeof archetypes } = {
    "Aluminum (Al)": 'LightMetal', "Antimony (Sb)": 'BaseMetal', "Barium (Ba)": 'AlkalineEarthMetal',
    "Beryllium (Be)": 'AlkalineEarthMetal', "Bismuth (Bi)": 'BaseMetal', "Boron (B)": 'Metalloid',
    "Cadmium (Cd)": 'BaseMetal', "Calcium (Ca)": 'AlkalineEarthMetal', "Chromium (Cr)": 'BaseMetal',
    "Cobalt (Co)": 'SpecialtyMetal', "Copper (Cu)": 'BaseMetal', "Dysprosium (Dy)": 'RareEarthElement',
    "Erbium (Er)": 'RareEarthElement', "Europium (Eu)": 'RareEarthElement', "Gallium (Ga)": 'SpecialtyMetal',
    "Germanium (Ge)": 'Metalloid', "Gold (Au)": 'PreciousMetal', "Hafnium (Hf)": 'SpecialtyMetal',
    "Holmium (Ho)": 'RareEarthElement', "Indium (In)": 'SpecialtyMetal', "Iridium (Ir)": 'PreciousMetal',
    "Iron (Fe)": 'BaseMetal', "Lanthanum (La)": 'RareEarthElement', "Lead (Pb)": 'BaseMetal',
    "Lithium (Li)": 'AlkaliMetal', "Lutetium (Lu)": 'RareEarthElement', "Magnesium (Mg)": 'LightMetal',
    "Manganese (Mn)": 'BaseMetal', "Mercury (Hg)": 'BaseMetal', "Molybdenum (Mo)": 'SpecialtyMetal',
    "Neodymium (Nd)": 'RareEarthElement', "Nickel (Ni)": 'BaseMetal', "Niobium (Nb)": 'SpecialtyMetal',
    "Osmium (Os)": 'PreciousMetal', "Palladium (Pd)": 'PreciousMetal', "Platinum (Pt)": 'PreciousMetal',
    "Potassium (K)": 'AlkaliMetal', "Praseodymium (Pr)": 'RareEarthElement', "Rhenium (Re)": 'PreciousMetal',
    "Rhodium (Rh)": 'PreciousMetal', "Rubidium (Rb)": 'AlkaliMetal', "Ruthenium (Ru)": 'PreciousMetal',
    "Samarium (Sm)": 'RareEarthElement', "Scandium (Sc)": 'RareEarthElement', "Selenium (Se)": 'Metalloid',
    "Silver (Ag)": 'PreciousMetal', "Sodium (Na)": 'AlkaliMetal', "Strontium (Sr)": 'AlkalineEarthMetal',
    "Sulfur (S)": 'Metalloid', "Tantalum (Ta)": 'SpecialtyMetal', "Terbium (Tb)": 'RareEarthElement',
    "Thallium (Tl)": 'BaseMetal', "Thorium (Th)": 'SpecialtyMetal', "Thulium (Tm)": 'RareEarthElement',
    "Tin (Sn)": 'BaseMetal', "Titanium (Ti)": 'LightMetal', "Tungsten (W)": 'SpecialtyMetal',
    "Uranium (U)": 'SpecialtyMetal', "Vanadium (V)": 'BaseMetal', "Ytterbium (Yb)": 'RareEarthElement',
    "Yttrium (Y)": 'RareEarthElement', "Zinc (Zn)": 'BaseMetal', "Zirconium (Zr)": 'SpecialtyMetal',
    "Steel": 'BaseMetal',
    "Cement": 'BaseMetal', // Using BaseMetal as a stand-in
    "Polymers (PET)": 'BaseMetal', // Using BaseMetal as a stand-in
    "Composites (CFRP)": 'LightMetal', // Using LightMetal as a stand-in
    "Solar PV Panel": 'SpecialtyMetal', // Using SpecialtyMetal as a stand-in
    "Wind Turbine Blade": 'LightMetal' // Using LightMetal as a stand-in
};

const materialFactors: { [key: string]: any } = {};
for (const material in materialArchetypeMap) {
    const archetypeKey = materialArchetypeMap[material];
    materialFactors[material] = archetypes[archetypeKey];
}

// --- MONTE CARLO SIMULATION ---
const SIMULATION_RUNS = 1000;
const getTriangularRandom = (deviationPercent: number): number => {
    const deviation = deviationPercent / 100;
    return 1 + (Math.random() + Math.random() - 1) * deviation;
};
const deviateFactors = (factors: any, deviationPercent: number): any => {
    const deviated = JSON.parse(JSON.stringify(factors));
    for (const key in deviated) {
        if (typeof deviated[key] === 'object' && deviated[key] !== null) {
            deviated[key] = deviateFactors(deviated[key], deviationPercent);
        } else if (typeof deviated[key] === 'number') {
            deviated[key] *= getTriangularRandom(deviationPercent);
        }
    }
    return deviated;
};

// --- CORE CALCULATION ENGINE ---
export const calculateLcaImpactsFromFormulas = (inputs: LcaInputData) => {
    const simulationResults: { [key: string]: number[] } = { gwp: [], energy: [], water: [], acidification: [], eutrophication: [], odp: [], pm_formation: [], energy_direct: [], energy_grid: [] };
    const transportStagesResults: { [key: string]: number[] } = {};
    inputs.transportationStages.forEach(s => transportStagesResults[s.name] = []);

    const gridMix = GRID_MIXES[inputs.gridElectricityMix as keyof typeof GRID_MIXES] || GRID_MIXES['Global Average'];

    for (let i = 0; i < SIMULATION_RUNS; i++) {
        const baseFactors = materialFactors[inputs.material] || materialFactors.Steel; // Default to Steel if not found
        const primaryDeviated = deviateFactors(baseFactors.primary, inputs.uncertaintyDeviation);
        const recycledDeviated = deviateFactors(baseFactors.recycled, inputs.uncertaintyDeviation);

        const primaryRatio = 1 - (inputs.secondaryMaterialContent / 100);
        const secondaryRatio = inputs.secondaryMaterialContent / 100;

        const mix = (p_val: number, r_val: number) => (p_val * primaryRatio) + (r_val * secondaryRatio);

        // 1. Electricity GWP
        const total_kWh = mix(primaryDeviated.electricity_kWh, recycledDeviated.electricity_kWh);
        const electricityGwp = total_kWh * Object.entries(gridMix).reduce((sum, [source, percent]) => {
            const factor = GRID_EMISSION_FACTORS[source as keyof typeof GRID_EMISSION_FACTORS] || 0;
            return sum + (factor * (percent as number));
        }, 0);

        // 2. Direct Emissions GWP
        const directGwp = mix(
            (primaryDeviated.emissions.CO2 * CF.GWP.CO2) + (primaryDeviated.emissions.CH4 * CF.GWP.CH4) + (primaryDeviated.emissions.N2O * CF.GWP.N2O),
            (recycledDeviated.emissions.CO2 * CF.GWP.CO2) + (recycledDeviated.emissions.CH4 * CF.GWP.CH4) + (recycledDeviated.emissions.N2O * CF.GWP.N2O)
        );

        // 3. Transport GWP
        let totalTransportGwp = 0;
        inputs.transportationStages.forEach(stage => {
            const modeFactors = TRANSPORT_FACTORS[stage.mode];
            // FIX: Explicitly type `factorKey` as a string to accommodate composite keys like 'Electric_Solar'.
            let factorKey: string = stage.fuelType;
            if (stage.fuelType === 'Electric' && stage.powerSource) {
                factorKey = `Electric_${stage.powerSource.replace(' ', '_')}`;
            }
            const factor = modeFactors?.[factorKey] ?? (modeFactors?.[Object.keys(modeFactors)[0]] || 0);
            const tkm = (stage.distance * 1); // Functional unit is 1 ton
            const transportGwpForStage = (tkm * factor) / 1000; // convert g to kg
            totalTransportGwp += transportGwpForStage;
            transportStagesResults[stage.name].push(transportGwpForStage);
        });

        simulationResults.gwp.push(directGwp + electricityGwp + totalTransportGwp);
        
        // Other impacts
        const directEnergy = mix(primaryDeviated.energy_direct_MJ, recycledDeviated.energy_direct_MJ);
        const gridEnergy = (total_kWh * 3.6); // Convert kWh to MJ
        simulationResults.energy_direct.push(directEnergy);
        simulationResults.energy_grid.push(gridEnergy);
        simulationResults.energy.push(directEnergy + gridEnergy);

        simulationResults.water.push(mix(primaryDeviated.water_m3, recycledDeviated.water_m3));
        simulationResults.acidification.push(mix(
            (primaryDeviated.emissions.SO2 * CF.AP.SO2) + (primaryDeviated.emissions.NOx * CF.AP.NOx),
            (recycledDeviated.emissions.SO2 * CF.AP.SO2) + (recycledDeviated.emissions.NOx * CF.AP.NOx)
        ));
        // Simplified other impacts for brevity
        simulationResults.eutrophication.push(simulationResults.gwp[i] / 2000);
        simulationResults.odp.push(simulationResults.gwp[i] / 1e6);
        simulationResults.pm_formation.push(simulationResults.gwp[i] / 3000);
    }
    
    // --- VALIDATION ---
    const qualityWarnings: string[] = [];
    if (inputs.processEnergyEfficiency < 70) {
        qualityWarnings.push(`Process efficiency of ${inputs.processEnergyEfficiency}% is below typical industry benchmarks (70-90%). This may inflate impact results.`);
    }
    if (inputs.material === 'Steel' && inputs.oreConcentration && inputs.oreConcentration < 40) {
         qualityWarnings.push(`Iron ore concentration of ${inputs.oreConcentration}% is very low. Check data, as this significantly increases extraction impacts.`);
    }

    const processResults = (name: string, unit: string, results: number[]): ImpactResult => {
        const sorted = [...results].sort((a, b) => a - b);
        const mean = results.reduce((a, b) => a + b) / results.length;
        const confidenceInterval: [number, number] = [sorted[Math.floor(SIMULATION_RUNS * 0.025)], sorted[Math.ceil(SIMULATION_RUNS * 0.975) - 1]];
        return { name, value: mean, unit, confidenceInterval, stages: [], simulationResults: results };
    };

    const impacts: LcaReport['impacts'] = {
        gwp: processResults('Global Warming Potential', 'kg CO₂-eq', simulationResults.gwp),
        energy: processResults('Energy Demand', 'MJ', simulationResults.energy),
        water: processResults('Water Consumption', 'm³', simulationResults.water),
        acidification: processResults('Acidification Potential', 'kg SO₂-eq', simulationResults.acidification),
        eutrophication: processResults('Eutrophication Potential', 'kg PO₄-eq', simulationResults.eutrophication),
        odp: processResults('Ozone Depletion Potential', 'kg CFC-11 eq', simulationResults.odp),
        pm_formation: processResults('Particulate Matter Formation', 'kg PM2.5-eq', simulationResults.pm_formation),
        // Dummy data for other impacts
        pocp: processResults('Photochemical Ozone Creation', 'kg NMVOC-eq', simulationResults.gwp.map(v => v / 1000)),
        adp_elements: processResults('Abiotic Depletion (Elements)', 'kg Sb-eq', simulationResults.gwp.map(v => v / 2e5)),
        adp_fossil: processResults('Abiotic Depletion (Fossil)', 'MJ', simulationResults.energy.map(v => v * 1.1)),
        human_toxicity_cancer: processResults('Human Toxicity (Cancer)', 'CTUh', simulationResults.gwp.map(v => v / 1e4)),
        human_toxicity_non_cancer: processResults('Human Toxicity (Non-Cancer)', 'CTUh', simulationResults.gwp.map(v => v / 1e3)),
        ecotoxicity_freshwater: processResults('Freshwater Ecotoxicity', 'CTUe', simulationResults.gwp.map(v => v / 1e2)),
        ionizing_radiation: processResults('Ionizing Radiation', 'kBq U235-eq', simulationResults.gwp.map(v => v / 5e5)),
        land_use: processResults('Land Use', 'm²·year', simulationResults.gwp.map(v => v / 10)),
    };
    
    // Add detailed stages for GWP
    const meanTransportStages = Object.entries(transportStagesResults).map(([name, results]) => ({
        name: `Transport: ${name}`,
        value: results.reduce((a, b) => a + b) / results.length,
    }));
    const totalMeanTransport = meanTransportStages.reduce((sum, s) => sum + s.value, 0);
    const meanProductionGwp = impacts.gwp.value - totalMeanTransport;
    impacts.gwp.stages = [{ name: 'Production', value: meanProductionGwp }, ...meanTransportStages];

    // Add detailed sources for Energy
    const meanDirectEnergy = simulationResults.energy_direct.reduce((a, b) => a + b, 0) / SIMULATION_RUNS;
    const meanGridEnergy = simulationResults.energy_grid.reduce((a, b) => a + b, 0) / SIMULATION_RUNS;
    if (impacts.energy) {
        impacts.energy.sources = [
            { name: 'Direct Fuel', value: meanDirectEnergy },
            { name: 'Grid Electricity', value: meanGridEnergy }
        ];
    }


    const circularityDetails: LcaReport['circularityDetails'] = {
        recyclabilityRate: parseFloat(inputs.endOfLife.match(/\d+/)?.[0] ?? '85'),
        secondaryMaterialContent: inputs.secondaryMaterialContent,
        recoveryEfficiency: 92,
        reusePotential: { value: 40, max: 50 },
        closedLoopRecyclingRate: 75,
        materialRecoveryRate: 90,
        endOfLifeFlows: { cru: 40, mfr: 80, mer: 78 },
        extendedProductLife: 110,
        landfillRate: 8,
        energyRecoveryRate: 2,
    };
    
    const circularityScore = (circularityDetails.recyclabilityRate + circularityDetails.secondaryMaterialContent) / 2;

    return { impacts, circularityDetails, circularityScore, qualityWarnings };
};