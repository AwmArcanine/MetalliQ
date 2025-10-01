
import { GoogleGenAI, Type } from "@google/genai";
import type { LcaInputData, LcaReport, User, LcaReport as LcaReportType, PlatformAnalytics, ImpactResult, PrimaryVsRecycled, TransportationStage, View, NewStudyFormState } from '../types';
import { calculateLcaImpactsFromFormulas } from './lcaFormulas';

const API_KEY_ERROR = 'API_KEY_MISSING';

const getAiInstance = () => {
    // In a plain browser environment, `process` is not defined.
    // This check handles that gracefully.
    if (typeof process === 'undefined' || !process.env.API_KEY) {
        console.error("Gemini API key is missing. Ensure the API_KEY is configured in your environment.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const ai = getAiInstance();


// --- NEW UNIFIED ANALYSIS PIPELINE ---

export const getLcaAnalysis = async (inputs: LcaInputData, currentUser: User, workspaceId: string): Promise<LcaReport> => {
    if (!ai) {
        throw new Error(API_KEY_ERROR);
    }
    // --- STEP 1: Calculate deterministic impacts using formulas ---
    let { impacts, circularityDetails, circularityScore, qualityWarnings } = calculateLcaImpactsFromFormulas(inputs);

    const primaryInputs = { ...inputs, secondaryMaterialContent: 0 };
    const { impacts: primaryImpacts } = calculateLcaImpactsFromFormulas(primaryInputs);
    const recycledInputs = { ...inputs, secondaryMaterialContent: 100 };
    const { impacts: recycledImpacts } = calculateLcaImpactsFromFormulas(recycledInputs);

    const calculateSavings = (primary: number, recycled: number) => {
        if (primary === 0) return 0;
        return ((primary - recycled) / primary) * 100;
    };
    
    const primaryVsRecycled: PrimaryVsRecycled = {
        primaryGwp: primaryImpacts.gwp.value,
        recycledGwp: recycledImpacts.gwp.value,
        gwpSavings: calculateSavings(primaryImpacts.gwp.value, recycledImpacts.gwp.value),
        primaryEnergy: primaryImpacts.energy.value / 1000, // MJ to GJ
        recycledEnergy: recycledImpacts.energy.value / 1000, // MJ to GJ
        energySavings: calculateSavings(primaryImpacts.energy.value, recycledImpacts.energy.value),
        primaryWater: primaryImpacts.water.value,
        recycledWater: recycledImpacts.water.value,
        waterSavings: calculateSavings(primaryImpacts.water.value, recycledImpacts.water.value),
        primaryAcidification: primaryImpacts.acidification.value,
        recycledAcidification: recycledImpacts.acidification.value,
        acidificationSavings: calculateSavings(primaryImpacts.acidification.value, recycledImpacts.acidification.value),
        primaryEutrophication: primaryImpacts.eutrophication.value,
        recycledEutrophication: recycledImpacts.eutrophication.value,
        eutrophicationSavings: calculateSavings(primaryImpacts.eutrophication.value, recycledImpacts.eutrophication.value),
        primaryOdp: primaryImpacts.odp.value,
        recycledOdp: recycledImpacts.odp.value,
        odpSavings: calculateSavings(primaryImpacts.odp.value, recycledImpacts.odp.value),
        aiComparisonConclusion: {
            bestRoute: recycledImpacts.gwp.value < primaryImpacts.gwp.value ? 'Recycled' : 'Primary',
            confidenceScore: 95,
            rationale: 'The recycled route demonstrates significantly lower impacts across key categories, primarily due to avoiding energy-intensive virgin material extraction.'
        }
    };


    // --- STEP 2: Use calculated results to prompt AI for qualitative analysis ---
    const model = 'gemini-2.5-flash';
    const qualitativePrompt = `
        You are an expert LCA analyst. Based on the following user-defined Goal & Scope and calculated environmental impact data for a material, generate the qualitative sections of a report. Provide your response as a single, valid JSON object with two keys: "hotspots" and "recommendations".

        **User's Goal & Scope:**
        - Intended Application: ${inputs.intendedApplication}
        - System Boundary: ${inputs.systemBoundary.join(', ')}

        **Calculated Data:**
        - Material: ${inputs.material}
        - Process: ${inputs.productionProcess} with ${inputs.secondaryMaterialContent}% recycled content.
        - Global Warming Potential (GWP): ${impacts.gwp.value.toFixed(0)} ${impacts.gwp.unit}
        - Energy Demand: ${impacts.energy.value.toFixed(0)} ${impacts.energy.unit}
        - Water Consumption: ${impacts.water.value.toFixed(1)} ${impacts.water.unit}
        - Circularity Score: ${circularityScore.toFixed(0)}%
        - GWP Stage Breakdown: ${impacts.gwp.stages.map(s => `${s.name}: ${s.value.toFixed(0)}`).join(', ')}

        **Instructions for JSON Output:**
        1.  **hotspots**: An array of 2-3 objects, each with "name" (string, e.g., "Raw Material Extraction") and "risk" ('High', 'Medium', or 'Low'). The stage with the highest impact should be 'High' risk.
        2.  **recommendations**: An array of 1-2 detailed recommendation objects. Each object must have: "id" (string), "title" (string, e.g., "High GWP from Primary Production Route"), "priority" ('High', 'Medium', 'Low'), "evidence" (string, a data-backed observation from the inputs), "rootCause" (string, explaining the evidence), and "actionSteps" (an array of action step objects).
        3.  **actionSteps**: Each object in the "actionSteps" array must have: "id" (string), "title" (string, e.g., "Step 1: ..."), "description" (string), "impact" (string, explaining the effect of the step), "effort" ('Low', 'Medium', 'High'), and "confidence" (number, 0-100).
        
        Ensure the entire output is a single, valid JSON object and nothing else.
    `;
    
    const actionStepSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING },
            effort: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
        },
        required: ['id', 'title', 'description', 'impact', 'effort', 'confidence']
    };

    const recommendationSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            priority: { type: Type.STRING },
            evidence: { type: Type.STRING },
            rootCause: { type: Type.STRING },
            actionSteps: { type: Type.ARRAY, items: actionStepSchema }
        },
        required: ['id', 'title', 'priority', 'evidence', 'rootCause', 'actionSteps']
    };

    const qualitativeSchema = {
        type: Type.OBJECT,
        properties: {
            hotspots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { name: { type: Type.STRING }, risk: { type: Type.STRING } },
                    required: ['name', 'risk']
                }
            },
            recommendations: {
                type: Type.ARRAY,
                items: recommendationSchema
            }
        },
        required: ['hotspots', 'recommendations']
    };

    const result = await ai.models.generateContent({
        model: model,
        contents: qualitativePrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: qualitativeSchema
        }
    });

    const aiData = JSON.parse(result.text);

    // --- STEP 3: Generate Life Cycle Interpretation (ISO 14044) ---
    const interpretationPrompt = `
        You are an expert LCA analyst adhering to ISO 14044 standards. Based on the user-defined Goal & Scope and the calculated environmental impacts, generate a "Life Cycle Interpretation" section.

        **User's Goal & Scope:**
        - Intended Application: ${inputs.intendedApplication}
        - Intended Audience: ${inputs.intendedAudience}
        - System Boundary: ${inputs.systemBoundary.join(', ')}
        - Limitations stated by user: ${inputs.limitations}

        **Data Quality & Uncertainty:**
        - Data Quality Score (ADQI): ${inputs.adqi.toFixed(1)} out of 5.0
        - Result Uncertainty: Approximately ±${inputs.uncertaintyDeviation}% based on a Monte Carlo simulation.

        **Key Calculated Results:**
        - Material: ${inputs.material}, Process: ${inputs.productionProcess} with ${inputs.secondaryMaterialContent}% recycled content
        - Mean GWP: ${impacts.gwp.value.toFixed(0)} ${impacts.gwp.unit}
        - 95% Confidence Interval for GWP: [${impacts.gwp.confidenceInterval[0].toFixed(0)}, ${impacts.gwp.confidenceInterval[1].toFixed(0)}]
        - Key Hotspot: ${aiData.hotspots[0]?.name || 'N/A'} contributing the most significant impact.
        - Circularity Score: ${circularityScore.toFixed(0)}%
        - Top Recommendation: ${aiData.recommendations[0]?.title || 'N/A'}

        **Instructions:**
        Generate a concise (2-3 paragraph) interpretation summary in plain text. It must include:
        1.  **Identification of Significant Issues:** Start by identifying the most significant environmental issues based on the data (e.g., "The analysis clearly identifies GWP from the production of ${inputs.material} as the most significant environmental impact...").
        2.  **Evaluation & Completeness:** Briefly evaluate the results in the context of the goal and scope. Explicitly mention the data quality score and how the result uncertainty might affect the conclusions (e.g., "The data quality score of ${inputs.adqi.toFixed(1)}/5.0 indicates a high degree of confidence in the input data. The Monte Carlo simulation shows a 95% confidence that the true GWP lies between X and Y. This range is narrow enough for reliable internal decision-making...").
        3.  **Conclusions & Recommendations:** Conclude with a summary of findings and reiterate the top recommendation in the context of the user's goals.

        The tone should be professional and objective. Do not use markdown.
    `;
    
    const interpretationResult = await ai.models.generateContent({
        model: model,
        contents: interpretationPrompt
    });
    const lifeCycleInterpretation = interpretationResult.text;


    // --- STEP 4: Assemble the final report ---
    let oreGradeWarning: string | null = null;
    let oreGradeUsed: number | null = null;
    let oreGradeSource: LcaReport['oreGradeSource'] = null;

    if (inputs.productionProcess === 'primary' && ['Copper (Cu)', 'Steel', 'Aluminum (Al)'].includes(inputs.material || '')) {
        if (inputs.oreConcentration) {
            oreGradeUsed = inputs.oreConcentration;
            oreGradeSource = 'user_provided';
            if (inputs.material === 'Copper (Cu)' && inputs.oreConcentration < 1.0) {
                 oreGradeWarning = `Low ore concentration (${inputs.oreConcentration}%) has been used, leading to higher calculated impacts for extraction and processing stages.`;
            } else if (inputs.material === 'Aluminum (Al)' && inputs.oreConcentration < 20) {
                oreGradeWarning = `Low ore concentration for Bauxite (${inputs.oreConcentration}%) is below typical viable grade (20-30%), leading to higher calculated impacts for extraction and processing stages.`;
            }
        } else {
            oreGradeUsed = inputs.material === 'Copper (Cu)' ? 0.8 : (inputs.material === 'Steel' ? 45 : 30);
            oreGradeSource = 'ai_estimated';
            qualityWarnings.push(`Ore concentration was not provided for this primary production route. An AI-estimated value of ${oreGradeUsed}% was used for the analysis, which may affect accuracy.`);
        }
    } else {
        oreGradeSource = 'not_applicable';
    }

    const fullReport: LcaReport = {
        id: `rep_${Date.now()}`,
        title: `${inputs.material} for ${inputs.projectName}`,
        author: currentUser.name,
        authorId: currentUser.id,
        workspaceId,
        createdAt: new Date().toISOString(),
        inputs,
        impacts,
        circularityScore,
        circularityDetails,
        supplyChainHotspots: aiData.hotspots.map((h: any, i: number) => ({
            ...h,
            percentage: i === 0 ? 65 : (i === 1 ? 25 : 10)
        })),
        aiActionPlan: {
            overallSummary: 'AI analysis suggests focusing on material sourcing and energy efficiency.',
            recommendations: aiData.recommendations
        },
        primaryVsRecycled,
        lifeCycleInterpretation,
        qualityWarnings,
        oreGradeWarning,
        oreGradeUsed,
        oreGradeSource,
        comments: [],
        activityLog: [{id:'act_1', actorId: currentUser.id, actorName: currentUser.name, action: 'created the report', target: 'Initial analysis', timestamp: new Date().toISOString() }],
    };
    
    return fullReport;
};


export const getAIChatResponse = async (
    message: string,
    context: {
        currentUser: User;
        allReports: LcaReportType[];
        currentReport: LcaReportType | null;
        currentView: View;
        newStudyFormData?: NewStudyFormState;
    }
): Promise<string> => {
    if (!ai) {
        throw new Error(API_KEY_ERROR);
    }
    const model = 'gemini-2.5-flash';
    let contextPrompt = `
        You are an AI assistant for MetalliQ, an LCA platform. 
        User: ${context.currentUser.name} (Role: ${context.currentUser.role}).
        The user is currently on the "${context.currentView}" page.
        Total reports in this workspace: ${context.allReports.length}.
    `;

    if (context.currentReport) {
        contextPrompt += ` The user is currently viewing the report: "${context.currentReport.title}" with a GWP of ${context.currentReport.impacts.gwp.value.toFixed(0)} kg CO2-eq.`;
    }

    if (context.currentView === 'newStudy' && context.newStudyFormData) {
        contextPrompt += `
The user is on the 'New Study' page, filling out a form. Here are some of the current values:
- Project Name: ${context.newStudyFormData.projectName}
- Material: ${context.newStudyFormData.material}
- Category: ${context.newStudyFormData.category}
- Production Process: ${context.newStudyFormData.productionProcess}
- Recycled Content: ${context.newStudyFormData.secondaryMaterialContent}%
- Functional Unit: ${context.newStudyFormData.functionalUnit}

When answering, you can refer to these values to provide more specific help, for example, suggesting typical values for the selected material or category, or explaining what a field means in the context of their current inputs.`;
    }

    const prompt = `${contextPrompt}\n\nUser query: "${message}"\n\nProvide a helpful and concise answer. Format with markdown if necessary.`;


    const result = await ai.models.generateContent({
        model,
        contents: prompt
    });

    return result.text;
};

export const getComparisonSuggestion = (reports: LcaReportType[], category: string): string => {
    const winner = reports.reduce((best, current) => current.impacts.gwp.value < best.impacts.gwp.value ? current : best);
    return `For a <strong>${category}</strong> application, <strong>${winner.inputs.material}</strong> appears to be the best choice from a climate perspective due to its lower Global Warming Potential. However, consider other factors like cost, durability, and other environmental impacts before making a final decision.`;
};


export const getAIOptimizedMaterialSuggestion = async (
    inputs: Omit<LcaInputData, 'material' | 'projectName' | 'intendedApplication' | 'intendedAudience' | 'isComparativeAssertion' | 'systemBoundary' | 'limitations' | 'reliability' | 'completeness' | 'temporal' | 'geographical' | 'technological' | 'adqi' | 'uncertaintyDeviation'>,
    currentResults: LcaReport[]
): Promise<string | null> => {
    if (!ai) {
        throw new Error(API_KEY_ERROR);
    }
    const model = 'gemini-2.5-flash';
    const analyzedMaterials = currentResults.map(r => r.inputs.material).join(', ');
    const bestCurrentMaterial = currentResults.reduce((best, current) => current.impacts.gwp.value < best.impacts.gwp.value ? current : best);

    const prompt = `
        You are a world-class materials science expert specializing in sustainability.
        A user is conducting a Life Cycle Assessment for a product in the "${inputs.category}" category.
        The functional unit is "${inputs.functionalUnit}".

        They have analyzed the following materials: ${analyzedMaterials}.
        The best performing material they found was ${bestCurrentMaterial.inputs.material} with a GWP of ${bestCurrentMaterial.impacts.gwp.value.toFixed(0)} kg CO2-eq.

        Consider the typical performance requirements (strength, durability, etc.) for a "${inputs.category}" application.
        From the following list of common industrial materials, is there a *better* alternative that would likely result in a lower environmental impact (especially GWP) while still being a viable choice for this application?

        Candidate Materials: ["Steel", "Aluminium", "Copper", "Cement", "Polymers (PET)", "Composites (CFRP)"]

        - If you identify a better material that is NOT in the user's analyzed list (${analyzedMaterials}), respond with a JSON object containing the name of that single best alternative.
        - If you believe one of the user's existing choices is already the best option, or if no clear better alternative exists, respond with a JSON object where the suggestedMaterial key has an empty string "" as its value.

        Example response for a better material:
        { "suggestedMaterial": "Copper" }

        Example response if no better material is found:
        { "suggestedMaterial": "" }
    `;

    const suggestionSchema = {
        type: Type.OBJECT,
        properties: {
            suggestedMaterial: { type: Type.STRING }
        },
        required: ['suggestedMaterial']
    };

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: suggestionSchema
        }
    });
    
    const responseJson = JSON.parse(result.text);
    return responseJson.suggestedMaterial || null; 
};

export const getTransportAIOptimization = async (
    stages: Omit<TransportationStage, 'id' | 'name'>[]
): Promise<string[]> => {
    if (!ai) throw new Error(API_KEY_ERROR);

    const model = 'gemini-2.5-flash';
    const prompt = `
        A user is planning several transport stages. For each stage listed below, provide one concise, actionable recommendation to reduce its environmental impact. Return the response as a valid JSON array of objects, where each object has an "index" (number) corresponding to the input stage and a "suggestion" (string).

        Input Stages:
        ${JSON.stringify(stages, null, 2)}

        Example JSON response format:
        [
            { "index": 0, "suggestion": "For the electric truck, charge during off-peak hours when more renewables are on the grid." },
            { "index": 1, "suggestion": "Consider shifting a portion of this long-haul diesel journey to rail to significantly cut emissions." }
        ]
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                index: { type: Type.NUMBER },
                suggestion: { type: Type.STRING }
            },
            required: ['index', 'suggestion']
        }
    };
    
    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });

    const suggestions: { index: number; suggestion: string }[] = JSON.parse(result.text);
    
    // Sort suggestions by index to ensure order matches input, then map to an array of strings
    return suggestions
        .sort((a, b) => a.index - b.index)
        .map(s => s.suggestion);
};


// --- ADMIN SERVICES (Simulated) ---

export const getPlatformAnalytics = async (reportsToProcess: LcaReport[], sampleSize?: number): Promise<PlatformAnalytics> => {
    const reports = sampleSize ? reportsToProcess.slice(0, sampleSize) : reportsToProcess;
    const isPreview = !!sampleSize;
    
    // Simulate longer processing for full dataset vs. preview
    const delay = isPreview ? 200 : 1500;
    await new Promise(res => setTimeout(res, delay));

    // KPIs
    const totalAnalyses = reports.length;
    const activeProjects = new Set(reports.map(r => r.inputs?.projectName)).size;

    // This KPI is no longer accurate with the new model, so we'll estimate savings for now.
    const avgGwpSavings = reports.reduce((acc, r) => {
        // Estimate savings based on secondary content. Assume recycled is ~70% better.
        const savings = (r.inputs.secondaryMaterialContent / 100) * 70;
        return acc + savings;
    }, 0) / (reports.length || 1);
    
    const hotspotCounts = (reports.flatMap(r => r.supplyChainHotspots || []) as {name: string, risk: string}[])
        .filter(h => h && h.risk === 'High' && h.name)
        .reduce((acc, h) => {
            acc[h.name] = (acc[h.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const topHotspot = Object.entries(hotspotCounts).sort(([,a],[,b]) => b-a)[0] || ['N/A', 0];

    // Chart Data
    const reportsByMonth = reports.reduce((acc, report) => {
        if (!report || !report.createdAt) return acc;
        const month = new Date(report.createdAt).toISOString().slice(0, 7); // "YYYY-MM"
        if (!acc[month]) acc[month] = [];
        acc[month].push(report);
        return acc;
    }, {} as Record<string, LcaReport[]>);

    const impactTrends = Object.entries(reportsByMonth)
        .sort(([monthA], [monthB]) => new Date(monthA).getTime() - new Date(monthB).getTime())
        .map(([month, monthReports]) => {
            const reportsCount = monthReports.length;
            const avgGwp = monthReports.reduce((sum, r) => sum + (r.impacts?.gwp?.value || 0), 0) / reportsCount;
            const avgCircularity = monthReports.reduce((sum, r) => sum + (Number(r.circularityScore) || 0), 0) / reportsCount;
            return {
                month: new Date(month + '-02').toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                reportsCount,
                avgGwp,
                avgCircularity
            };
        });

    const reportsByMaterial = reports.reduce((acc, report) => {
        const material = report.inputs?.material;
        if (!material) return acc;
        if (!acc[material]) acc[material] = [];
        acc[material].push(report);
        return acc;
    }, {} as Record<string, LcaReport[]>);

    const materialPerformance = Object.entries(reportsByMaterial).map(([name, materialReports]) => {
        const studyCount = materialReports.length;
        const gwp = materialReports.reduce((sum, r) => sum + (r.impacts?.gwp?.value || 0), 0) / studyCount;
        const circularity = materialReports.reduce((sum, r) => sum + (Number(r.circularityScore) || 0), 0) / studyCount;
        return { name, gwp, circularity, studyCount };
    });
    
    const crossUserHotspots = Object.entries(hotspotCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);

    const primaryCount = reports.filter(r => r.inputs?.productionProcess === 'primary').length;
    const recycledCount = totalAnalyses - primaryCount;
    const productionProcessDistribution = [
        { name: 'Primary Route', value: primaryCount },
        { name: 'Recycled Route', value: recycledCount }
    ];

    return {
        totalAnalyses,
        activeProjects,
        avgGwpSavings,
        topHotspot: { name: topHotspot[0], count: topHotspot[1] },
        impactTrends,
        materialPerformance,
        crossUserHotspots,
        productionProcessDistribution,
        isPreview,
    };
};


export const simulateRetraining = async () => {
    await new Promise(res => setTimeout(res, 3000));
    return {
        newVersion: '2.2',
        newAccuracy: 96.8,
    };
};
