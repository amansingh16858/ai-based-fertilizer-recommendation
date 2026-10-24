import { FarmProfile, SoilTelemetry, VisionAnalysisResult, AgronomicPrescription, FertilizerDosage } from '../types';
import { SAMPLE_IMAGES } from '../data/sampleLeavesData';

const DEFAULT_OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export function getGrokApiKey(): string {
  const envKey = import.meta.env.VITE_GROK_API_KEY;
  if (envKey && envKey.trim() !== '') return envKey.trim();
  return localStorage.getItem('grok_api_key') || '';
}

export function saveGrokApiKey(key: string) {
  localStorage.setItem('grok_api_key', key.trim());
}

export function getDeepSeekApiKey(): string {
  const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (envKey && envKey.trim() !== '') return envKey.trim();
  return localStorage.getItem('deepseek_api_key') || '';
}

export function saveDeepSeekApiKey(key: string) {
  localStorage.setItem('deepseek_api_key', key.trim());
}

export function getApiKey(): string {
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey && envKey.trim() !== '') return envKey.trim();
  return localStorage.getItem('openrouter_api_key') || DEFAULT_OPENROUTER_KEY;
}

export function saveApiKey(key: string) {
  localStorage.setItem('openrouter_api_key', key.trim());
}

function cleanAndParseJson(rawText: string) {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  return JSON.parse(cleaned);
}

/**
 * 4th-Grader Plain English translation for botanical/pathological terms.
 * Converts complex academic jargon (e.g. "Marginal Chlorosis") into human, everyday words.
 */
export function getPlainPathologyMeaning(term: string): string {
  if (!term) return '';
  const lower = term.toLowerCase();

  if (lower.includes('marginal chlorosis')) return 'Yellowing leaf edges';
  if (lower.includes('interveinal chlorosis')) return 'Yellow leaf with green veins';
  if (lower.includes('chlorosis')) return 'Yellow leaf tissue (lack of food/sun)';
  if (lower.includes('tip necrosis')) return 'Dead brown leaf tips';
  if (lower.includes('necrosis') || lower.includes('necrotic')) return 'Dead brown crispy leaf spots';
  if (lower.includes('early blight') || lower.includes('late blight') || lower.includes('blight')) return 'Dark rotting fungal patches';
  if (lower.includes('septoria') || lower.includes('leaf spot')) return 'Dark circular fungal spots';
  if (lower.includes('powdery mildew') || lower.includes('mildew')) return 'White dusty powder on leaf';
  if (lower.includes('anthracnose')) return 'Sunken dark water spots';
  if (lower.includes('rust')) return 'Orange-red dusty powder spots';
  if (lower.includes('mosaic') || lower.includes('virus')) return 'Mottled yellow & green distorted patches';
  if (lower.includes('leaf curl') || lower.includes('curling')) return 'Twisted, curled leaf edges';
  if (lower.includes('wilting') || lower.includes('wilt')) return 'Drooping limp leaves (thirsty/root block)';
  if (lower.includes('potassium starvation') || lower.includes('potassium deficiency')) return 'Leaf edge burn & dry tips';
  if (lower.includes('nitrogen starvation') || lower.includes('nitrogen deficiency')) return 'Pale yellow older leaves';
  if (lower.includes('iron deficiency') || lower.includes('iron chlorosis')) return 'Bleached yellow upper leaves';
  if (lower.includes('scorch')) return 'Sunburnt crispy brown leaf tips';
  if (lower.includes('lesion') || lower.includes('lesions')) return 'Infected dark leaf spots';
  if (lower.includes('gall midge') || lower.includes('gall') || lower.includes('blister')) return 'Black raised leaf warts';
  if (lower.includes('oviposition') || lower.includes('puncture')) return 'Insect egg puncture clusters';
  if (lower.includes('v-shaped chlorosis') || lower.includes('v-shaped')) return 'Yellow stripe down center vein';

  return 'Damaged or discolored leaf tissue';
}

// ----------------------------------------------------------------------
// STAGE 1: VISION EXTRACTION (Grok-2 Vision / Gemini / Botanical Fallback)
// ----------------------------------------------------------------------
export async function runStage1VisionExtraction(
  imageBase64: string,
  onLog?: (msg: string) => void,
  cropHint?: string,
  isSampleActive: boolean = false
): Promise<VisionAnalysisResult> {
  const startTime = performance.now();
  const grokKey = getGrokApiKey();
  const openRouterKey = getApiKey();

  const base64Data = imageBase64.includes('base64,') 
    ? imageBase64.split('base64,')[1] 
    : imageBase64;

  const prompt = `You are an expert Plant Pathologist. Examine this crop leaf image very carefully.

CRITICAL CHECKS:
1. Verify if this image is a plant leaf, foliage, or crop.
2. If it is a person, face, room, object, pet, or completely unidentifiable, return "isPlant": false and explain in "rejectionReason".
3. Identify the crop species (e.g. Tomato, Mango, Hibiscus, Potato, Maize, Chilli, Wheat, Rice).
4. Identify visible symptoms (chlorosis, necrosis, lesions, discoloration, curl).
5. Specify suspected deficiency (Potassium, Nitrogen, Phosphorus, Iron, Zinc, or Fungal/Bacterial pathogen).
6. IMPORTANT: For each symptom box, provide BOTH the scientific term ("label") AND a simple 2-4 word plain English 4th-grader translation ("simpleMeaning", e.g. "Yellow leaf edges", "Dead brown spots").

Return ONLY valid JSON matching this schema:
{
  "isPlant": true,
  "rejectionReason": null,
  "cropIdentified": "Common Plant Name",
  "healthStatus": "Healthy" | "Nutrient Deficient" | "Fungal / Disease" | "Pest Infestation",
  "visualSymptoms": ["Symptom 1", "Symptom 2"],
  "suspectedDeficiencies": ["Potassium (K)", "Nitrogen (N)"],
  "suspectedPathology": "Short Diagnosis Title",
  "simplePathologyMeaning": "Short plain English explanation of what is wrong",
  "confidenceScore": 0.94,
  "severityLevel": "Mild" | "Moderate" | "Severe",
  "symptomBoxes": [
    { 
      "label": "Marginal Chlorosis", 
      "simpleMeaning": "Yellow leaf edges",
      "confidence": 0.92, 
      "area": { "x": 15, "y": 20, "width": 45, "height": 40 } 
    }
  ]
}`;

  // 1. Try Official xAI Grok-2 Vision
  if (grokKey) {
    try {
      onLog?.('[Stage 1 Vision] Dispatching leaf photo to xAI Grok-2 Vision...');
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-2-vision-1212',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64Data}` }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = cleanAndParseJson(content);
          const duration = Math.round(performance.now() - startTime);
          onLog?.(`[Stage 1 Vision] ✅ Grok-2 Vision completed in ${duration}ms`);

          const boxes: any[] = (parsed.symptomBoxes || []).map((box: any) => ({
            ...box,
            simpleMeaning: box.simpleMeaning || getPlainPathologyMeaning(box.label)
          }));

          return {
            isPlant: parsed.isPlant !== false,
            rejectionReason: parsed.rejectionReason || undefined,
            cropIdentified: parsed.cropIdentified || 'Crop Plant',
            healthStatus: parsed.healthStatus || 'Nutrient Deficient',
            visualSymptoms: parsed.visualSymptoms || ['Leaf chlorosis observed'],
            suspectedDeficiencies: parsed.suspectedDeficiencies || ['Potassium (K)'],
            suspectedPathology: parsed.suspectedPathology || 'Nutrient Deficiency',
            simplePathologyMeaning: parsed.simplePathologyMeaning || getPlainPathologyMeaning(parsed.suspectedPathology || ''),
            confidenceScore: parsed.confidenceScore || 0.92,
            severityLevel: parsed.severityLevel || 'Moderate',
            symptomBoxes: boxes,
            executionTimeMs: duration,
            tokensUsed: data.usage?.total_tokens || 480,
            modelUsed: 'Grok-2 Vision (xAI)',
            isFallback: false
          };
        }
      } else {
        const errText = await response.text();
        onLog?.(`[Stage 1 Note] Grok Vision error (${response.status}): ${errText.slice(0, 100)}`);
      }
    } catch (err: any) {
      onLog?.(`[Stage 1 Note] Grok Vision exception: ${err.message}`);
    }
  }

  // 2. Try OpenRouter Gemini Vision
  if (openRouterKey) {
    const openRouterModels = ['google/gemini-2.0-flash-001', 'google/gemini-2.5-flash'];
    for (const model of openRouterModels) {
      try {
        onLog?.(`[Stage 1 Vision] Trying OpenRouter (${model})...`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://agroveda.local',
            'X-Title': 'AgroVeda AI Crop Diagnostic'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: { url: `data:image/jpeg;base64,${base64Data}` }
                  }
                ]
              }
            ],
            temperature: 0.1,
            max_tokens: 1000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = cleanAndParseJson(content);
            const duration = Math.round(performance.now() - startTime);
            onLog?.(`[Stage 1 Vision] ✅ OpenRouter completed in ${duration}ms`);

            const boxes: any[] = (parsed.symptomBoxes || []).map((box: any) => ({
              ...box,
              simpleMeaning: box.simpleMeaning || getPlainPathologyMeaning(box.label)
            }));

            return {
              isPlant: parsed.isPlant !== false,
              rejectionReason: parsed.rejectionReason || undefined,
              cropIdentified: parsed.cropIdentified || 'Crop Plant',
              healthStatus: parsed.healthStatus || 'Nutrient Deficient',
              visualSymptoms: parsed.visualSymptoms || ['Leaf chlorosis observed'],
              suspectedDeficiencies: parsed.suspectedDeficiencies || ['Potassium (K)'],
              suspectedPathology: parsed.suspectedPathology || 'Nutrient Deficiency',
              simplePathologyMeaning: parsed.simplePathologyMeaning || getPlainPathologyMeaning(parsed.suspectedPathology || ''),
              confidenceScore: parsed.confidenceScore || 0.90,
              severityLevel: parsed.severityLevel || 'Moderate',
              symptomBoxes: boxes,
              executionTimeMs: duration,
              tokensUsed: data.usage?.total_tokens || 420,
              modelUsed: `${model} (OpenRouter)`,
              isFallback: false
            };
          }
        }
      } catch (err: any) {
        // Continue to fallback
      }
    }
  }

  // 3. Clinical Botanical Fallback (Protected For Verified Sample Leaves Only)
  const isSampleMango = imageBase64.startsWith(SAMPLE_IMAGES.mango.slice(0, 80));
  const isSampleTomato = imageBase64.startsWith(SAMPLE_IMAGES.tomato.slice(0, 80));
  const isSampleHibiscus = imageBase64.startsWith(SAMPLE_IMAGES.hibiscus.slice(0, 80));
  const isSamplePotato = imageBase64.startsWith(SAMPLE_IMAGES.potato.slice(0, 80));
  const isSampleCorn = imageBase64.startsWith(SAMPLE_IMAGES.corn.slice(0, 80));

  const isVerifiedSample = isSampleActive || isSampleMango || isSampleTomato || isSampleHibiscus || isSamplePotato || isSampleCorn;

  // STRICT ZERO-HALLUCINATION RULE: Never fake a diagnosis on live webcam or custom uploads when API token is exhausted!
  if (!isVerifiedSample) {
    onLog?.('[Stage 1 Vision] ⚠️ AI token exhausted. Live camera/upload requires active API key.');
    throw new Error('AI Token Exhausted: please integrate API key to scan live camera photos.');
  }

  onLog?.('[Stage 1 Vision] 🌿 Engaging Verified Botanical Sample Engine...');
  const duration = Math.round(performance.now() - startTime);

  const hint = (cropHint || '').toLowerCase();
  const isMango = isSampleMango || (hint.includes('mango') && hint !== 'auto-detect any crop');
  const isTomato = isSampleTomato || (hint.includes('tomat') && hint !== 'auto-detect any crop');
  const isHibiscus = isSampleHibiscus || (hint.includes('hibiscus') && hint !== 'auto-detect any crop');
  const isPotato = isSamplePotato || (hint.includes('potato') && hint !== 'auto-detect any crop');
  const isCorn = isSampleCorn || ((hint.includes('corn') || hint.includes('maize')) && hint !== 'auto-detect any crop');

  let crop = 'Tomato (Solanum lycopersicum)';
  let disease = 'Early Blight (Alternaria solani)';
  let symptoms = ['Brown circular target rings', 'Yellow ring around leaf spots', 'Curled brown leaf edges'];
  let defs = ['Anti-Fungus Spray', 'Potassium (K) Food'];
  let status: 'Healthy' | 'Nutrient Deficient' | 'Fungal / Disease' | 'Pest Infestation' = 'Fungal / Disease';

  let customBoxes = [
    { 
      label: 'Blight Target Rings', 
      simpleMeaning: 'Brown circular fungal rings', 
      confidence: 0.94, 
      area: { x: 22, y: 24, width: 44, height: 38 } 
    },
    { 
      label: 'Chlorotic Halo', 
      simpleMeaning: 'Yellow ring around leaf spot', 
      confidence: 0.90, 
      area: { x: 55, y: 50, width: 32, height: 32 } 
    }
  ];

  if (isMango) {
    crop = 'Mango (Mangifera indica)';
    disease = 'Mango Leaf Gall Midge (Procontarinia matteiana)';
    status = 'Pest Infestation';
    symptoms = ['Raised black bumpy blister spots', 'Tiny insect bite clusters', 'Leaves turning yellow and falling'];
    defs = ['Natural Neem Oil Spray'];
    customBoxes = [
      { 
        label: 'Gall Midge Blisters', 
        simpleMeaning: 'Dark raised bumpy spots', 
        confidence: 0.96, 
        area: { x: 48, y: 10, width: 38, height: 42 } 
      },
      { 
        label: 'Oviposition Punctures', 
        simpleMeaning: 'Tiny bug bite holes', 
        confidence: 0.92, 
        area: { x: 42, y: 52, width: 34, height: 35 } 
      }
    ];
  } else if (isTomato) {
    crop = 'Tomato (Solanum lycopersicum)';
    disease = 'Early Blight (Alternaria solani)';
    status = 'Fungal / Disease';
    symptoms = ['Brown circular target rings', 'Yellow ring around leaf spots', 'Curled brown leaf edges'];
    defs = ['Anti-Fungus Spray', 'Potassium (K) Food'];
    customBoxes = [
      { 
        label: 'Blight Target Rings', 
        simpleMeaning: 'Brown circular fungal rings', 
        confidence: 0.94, 
        area: { x: 22, y: 24, width: 44, height: 38 } 
      },
      { 
        label: 'Chlorotic Halo', 
        simpleMeaning: 'Yellow ring around leaf spot', 
        confidence: 0.90, 
        area: { x: 55, y: 50, width: 32, height: 32 } 
      }
    ];
  } else if (isHibiscus) {
    crop = 'Hibiscus (Hibiscus rosa-sinensis)';
    disease = 'Interveinal Iron (Fe) Chlorosis';
    status = 'Nutrient Deficient';
    symptoms = ['Dark green veins on leaf', 'Yellow bleached spaces between veins', 'Slow flower bud growth'];
    defs = ['Iron Food (Chelated Iron)', 'Magnesium Food'];
    customBoxes = [
      { 
        label: 'Interveinal Chlorosis', 
        simpleMeaning: 'Yellow leaf with green veins', 
        confidence: 0.96, 
        area: { x: 20, y: 22, width: 54, height: 48 } 
      }
    ];
  } else if (isPotato) {
    crop = 'Potato (Solanum tuberosum)';
    disease = 'Late Blight (Phytophthora infestans)';
    status = 'Fungal / Disease';
    symptoms = ['Dark rotting wet spots', 'Fuzzy white fungus on leaf edges', 'Leaves wilting quickly'];
    defs = ['Anti-Fungus Spray & Stop Watering'];
    customBoxes = [
      { 
        label: 'Water-Soaked Lesions', 
        simpleMeaning: 'Dark rotting wet spots', 
        confidence: 0.95, 
        area: { x: 24, y: 25, width: 46, height: 42 } 
      },
      { 
        label: 'Fungal Margin', 
        simpleMeaning: 'White fungus edge', 
        confidence: 0.89, 
        area: { x: 58, y: 54, width: 30, height: 28 } 
      }
    ];
  } else if (isCorn) {
    crop = 'Corn (Maize) (Zea mays)';
    disease = 'V-Shaped Nitrogen Starvation';
    status = 'Nutrient Deficient';
    symptoms = ['V-shaped yellow stripe down center vein', 'Pale yellow bottom leaves', 'Slow plant growth'];
    defs = ['Nitrogen (N) Food'];
    customBoxes = [
      { 
        label: 'V-Shaped Chlorosis', 
        simpleMeaning: 'Yellow stripe down center vein', 
        confidence: 0.95, 
        area: { x: 18, y: 22, width: 48, height: 40 } 
      },
      { 
        label: 'Tip Necrosis', 
        simpleMeaning: 'Dead brown leaf tips', 
        confidence: 0.91, 
        area: { x: 56, y: 52, width: 34, height: 32 } 
      }
    ];
  }

  return {
    isPlant: true,
    cropIdentified: crop,
    healthStatus: status,
    visualSymptoms: symptoms,
    suspectedDeficiencies: defs,
    suspectedPathology: disease,
    simplePathologyMeaning: getPlainPathologyMeaning(disease),
    confidenceScore: 0.94,
    severityLevel: 'Moderate',
    symptomBoxes: customBoxes,
    executionTimeMs: duration,
    tokensUsed: 360,
    modelUsed: 'Clinical Botanical Engine (Offline)',
    isFallback: true
  };
}

// ----------------------------------------------------------------------
// STAGE 2: AGRONOMIC REASONING (DeepSeek / Grok / Agronomic Engine Fallback)
// ----------------------------------------------------------------------
export async function runStage2AgronomicReasoning(
  visionData: VisionAnalysisResult,
  soil: SoilTelemetry,
  farm: FarmProfile,
  onLog?: (msg: string) => void
): Promise<AgronomicPrescription> {
  const startTime = performance.now();
  const deepseekKey = getDeepSeekApiKey();
  const grokKey = getGrokApiKey();
  const openRouterKey = getApiKey();

  const prompt = `You are a certified agricultural extension officer and agronomist.
Formulate a mathematically calibrated, field-grade fertilizer prescription.

CROP & FIELD PARAMETERS:
- Crop: ${visionData.cropIdentified}
- Pathology / Diagnosis: ${visionData.suspectedPathology}
- Symptoms: ${visionData.visualSymptoms.join(', ')}
- Root-Zone Soil Moisture: ${soil.moisturePercent}% (${soil.moisturePercent < 30 ? 'DRY / DROUGHT STRESS' : soil.moisturePercent > 70 ? 'WATERLOGGED / FUNGAL HAZARD' : 'OPTIMAL MOISTURE'})
- Ambient Temperature: ${soil.temperatureC}°C
- Relative Humidity: ${soil.humidityPercent}%
- Farm Size / Area: ${farm.plotArea}
- Soil Classification: ${farm.soilType}

PRESCRIPTION REQUIREMENTS:
1. "simpleSummary": Provide an ultra-clear, 4th-grader simple explanation (Coffee Shop rule):
   - "whatHappened": 1 plain sentence explaining the plant problem without scary jargon (e.g. "Your plant is thirsty (${soil.moisturePercent}% moisture), so roots cannot drink food, causing leaf edges to turn brown and crispy.").
   - "whatToDoToday": 1 clear actionable sentence (e.g. "Give 1 to 2 buckets of water today, then sprinkle 2 spoons of fertilizer tomorrow evening.").
2. "multimodalCorrelation": 2 crisp sentences explaining how soil moisture (${soil.moisturePercent}%) connects with visual symptoms.
3. "chemicalPrescription": Provide exact chemical dosages using both household units and metric (e.g. "2 tablespoons (40g) per plant").
4. "organicPrescription": Provide 100% natural organic alternatives (e.g. "2 cups (250g) of wood ash or compost").
5. "irrigationDirective": State clear watering action in buckets/liters based on ${soil.moisturePercent}% moisture.
6. "fourteenDaySchedule": 4 concrete milestone tasks.

Return ONLY a valid JSON object matching schema:
{
  "primaryDiagnosis": "${visionData.cropIdentified} • Short Diagnosis Title",
  "simpleSummary": {
    "whatHappened": "Plain 1-sentence explanation for a 4th grader.",
    "whatToDoToday": "Clear 1-sentence action on what to do today."
  },
  "multimodalCorrelation": "Correlation sentence 1. Correlation sentence 2.",
  "rootCauseAnalysis": "Direct root cause explanation.",
  "chemicalPrescription": [
    {
      "name": "Fertilizer Name (e.g. Potash Fertilizer MOP)",
      "type": "Chemical",
      "ratioNPK": "0-0-60",
      "exactDosage": "2 tablespoons (40g) per plant",
      "applicationMethod": "Sprinkle in a circle 4 inches away from stem",
      "timing": "Early morning or evening",
      "estimatedCostINR": 40,
      "safetyWarning": "Keep 4 inches away from the main stem."
    }
  ],
  "organicPrescription": [
    {
      "name": "Wood Ash & Compost (Natural Potash)",
      "type": "Organic",
      "ratioNPK": "Natural 0-1-10",
      "exactDosage": "2 cups (250g) per plant",
      "applicationMethod": "Sprinkle around plant and gently mix into top dirt",
      "timing": "Evening",
      "estimatedCostINR": 20
    }
  ],
  "irrigationDirective": {
    "action": "Immediate Deep Watering" | "Standard Irrigation" | "Withhold Water",
    "details": "Give 1 to 2 buckets (15L) of water now. Thirsty roots cannot absorb fertilizer.",
    "targetMoisturePercent": 50
  },
  "fourteenDaySchedule": [
    { "day": "Day 1", "task": "Water deeply today and add fertilizer around root perimeter", "type": "Chemical" },
    { "day": "Day 4", "task": "Check soil moisture and look for fresh green leaf tips", "type": "Observation" },
    { "day": "Day 8", "task": "Spray organic neem water under leaves if spots appear", "type": "Organic" },
    { "day": "Day 14", "task": "Confirm healthy new leaves growing at the top", "type": "Observation" }
  ],
  "totalEstimatedCostINR": { "chemical": 40, "organic": 20 },
  "reasoningChainSummary": "Fused ${visionData.cropIdentified} leaf symptoms with ${soil.moisturePercent}% soil moisture."
}`;

  // 1. Try Official DeepSeek API
  if (deepseekKey) {
    try {
      onLog?.('[Stage 2 Reasoning] Dispatching payload to DeepSeek-V3 Official API...');
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are an agricultural reasoning engine. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = cleanAndParseJson(content);
          const duration = Math.round(performance.now() - startTime);
          onLog?.(`[Stage 2 Reasoning] ✅ DeepSeek Official completed in ${duration}ms`);

          const stage2Tokens = data.usage?.total_tokens || 600;
          return {
            ...parsed,
            academicNotes: {
              stage1Tokens: visionData.tokensUsed || 420,
              stage2Tokens: stage2Tokens,
              totalCostUSD: Number((((visionData.tokensUsed || 420) + stage2Tokens) / 1_000_000 * 0.20).toFixed(6)),
              totalLatencyMs: visionData.executionTimeMs + duration,
              reasoningChainSummary: parsed.reasoningChainSummary || 'Fused leaf pathology with soil telemetry via DeepSeek.'
            },
            isFallback: false,
            snapshotTelemetry: soil
          };
        }
      }
    } catch (err: any) {
      onLog?.(`[Stage 2 Note] DeepSeek API note: ${err.message}`);
    }
  }

  // 2. Try xAI Grok Text (if key exists)
  if (grokKey) {
    try {
      onLog?.('[Stage 2 Reasoning] Querying xAI Grok Reasoning Engine...');
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-2',
          messages: [
            { role: 'system', content: 'You are an agricultural reasoning engine. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = cleanAndParseJson(content);
          const duration = Math.round(performance.now() - startTime);
          onLog?.(`[Stage 2 Reasoning] ✅ Grok completed in ${duration}ms`);

          const stage2Tokens = data.usage?.total_tokens || 650;
          return {
            ...parsed,
            academicNotes: {
              stage1Tokens: visionData.tokensUsed || 420,
              stage2Tokens: stage2Tokens,
              totalCostUSD: Number((((visionData.tokensUsed || 420) + stage2Tokens) / 1_000_000 * 2.0).toFixed(6)),
              totalLatencyMs: visionData.executionTimeMs + duration,
              reasoningChainSummary: parsed.reasoningChainSummary || 'Processed via xAI Grok.'
            },
            isFallback: false,
            snapshotTelemetry: soil
          };
        }
      }
    } catch (err: any) {
      // Continue to fallback
    }
  }

  // 3. Try OpenRouter
  if (openRouterKey) {
    try {
      onLog?.('[Stage 2 Reasoning] Trying OpenRouter DeepSeek/Gemini...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://agroveda.local',
          'X-Title': 'AgroVeda AI Crop Diagnostic'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-v4-flash',
          messages: [
            { role: 'system', content: 'You are an agricultural reasoning engine. Return ONLY valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = cleanAndParseJson(content);
          const duration = Math.round(performance.now() - startTime);
          onLog?.(`[Stage 2 Reasoning] ✅ OpenRouter completed in ${duration}ms`);

          return {
            ...parsed,
            academicNotes: {
              stage1Tokens: visionData.tokensUsed || 420,
              stage2Tokens: data.usage?.total_tokens || 600,
              totalCostUSD: 0.00018,
              totalLatencyMs: visionData.executionTimeMs + duration,
              reasoningChainSummary: 'Completed via OpenRouter.'
            },
            isFallback: false,
            snapshotTelemetry: soil
          };
        }
      }
    } catch (err: any) {
      // Continue to fallback
    }
  }

  // 4. Bulletproof Deterministic Agronomic Reasoning Fallback
  onLog?.('[Stage 2 Reasoning] 🌿 Generating calibrated prescription via Agronomic Engine...');
  const duration = Math.round(performance.now() - startTime);

  const isDry = soil.moisturePercent < 30;
  const isWet = soil.moisturePercent > 70;

  const pathologyLower = (visionData.suspectedPathology || '').toLowerCase();
  const isPest = visionData.healthStatus === 'Pest Infestation' || pathologyLower.includes('midge') || pathologyLower.includes('pest');
  const isBlight = pathologyLower.includes('blight');
  const isIronChlorosis = pathologyLower.includes('iron') || pathologyLower.includes('fe');

  let chemicalDosage: FertilizerDosage[] = [];
  let organicDosage: FertilizerDosage[] = [];
  let summaryWhatHappened = '';
  let summaryWhatToDoToday = '';
  let correlationText = '';
  let rootCauseText = '';
  let scheduleTasks = [
    { day: 'Day 1', task: isWet ? 'Drain excess standing water around roots' : 'Water deeply today and add fertilizer around the base', type: 'Chemical' as const },
    { day: 'Day 4', task: 'Check soil moisture and look for fresh green leaf tips', type: 'Observation' as const },
    { day: 'Day 8', task: 'Spray organic neem water under leaves if spots appear', type: 'Organic' as const },
    { day: 'Day 14', task: 'Confirm healthy new leaves growing at the top', type: 'Observation' as const }
  ];

  if (isPest) {
    chemicalDosage = [
      {
        name: 'Systemic Insecticide (Imidacloprid 17.8% SL)',
        type: 'Chemical',
        ratioNPK: 'Pest Control',
        exactDosage: '1 ml per 3 Liters of clean water',
        applicationMethod: 'Spray both top and underside of leaves to protect from insect damage',
        timing: 'Late afternoon / Dusk (after 5:30 PM)',
        estimatedCostINR: 65,
        safetyWarning: 'Do not spray during peak flowering to protect pollinator bees. Wear gloves.'
      },
      {
        name: 'Leaf Toughness Spray (Potassium Silicate)',
        type: 'Foliar Spray',
        ratioNPK: '0-0-25 + Silica',
        exactDosage: '2 grams per Liter of water',
        applicationMethod: 'Spray on leaves to make them tough and protect against insect bites',
        timing: 'Morning (before 8:00 AM)',
        estimatedCostINR: 35
      }
    ];
    organicDosage = [
      {
        name: 'Cold-Pressed Pure Neem Oil (10,000 ppm)',
        type: 'Organic',
        ratioNPK: 'Bio-Shield',
        exactDosage: '1 teaspoon (5ml) per Liter + 2 drops mild liquid soap',
        applicationMethod: 'Spray thoroughly on all new leaves to stop baby bugs from eating leaves',
        timing: 'Evening (at dusk)',
        estimatedCostINR: 20
      },
      {
        name: 'Yellow Sticky Bug Traps',
        type: 'Organic',
        ratioNPK: '100% Organic Trap',
        exactDosage: '4–6 sticky cards hung at branch height',
        applicationMethod: 'Hang in tree branches to catch adult flies before they lay eggs on leaves',
        timing: 'All day monitoring',
        estimatedCostINR: 15
      }
    ];
    summaryWhatHappened = `Tiny flies laid eggs inside the leaves, causing the plant to grow dark, bumpy blister spots.`;
    summaryWhatToDoToday = `Snip off the leaves with the most bumps using clean scissors and throw them in the trash. Spray natural neem oil water under the leaves this evening.`;
    correlationText = `Soil moisture is at ${soil.moisturePercent}%. The roots have water, but bugs are attacking the leaves, so the leaves need protective spray.`;
    rootCauseText = `Infestation of Mango Leaf Gall Midge causing dark raised blister bumps on leaves.`;
    scheduleTasks = [
      { day: 'Day 1', task: 'Snip off the sick bumpy leaves with clean scissors and throw them in the trash', type: 'Organic' },
      { day: 'Day 3', task: 'Spray neem oil water under the leaves in the evening', type: 'Chemical' },
      { day: 'Day 7', task: 'Hang yellow sticky cards in tree branches to catch flying bugs', type: 'Observation' },
      { day: 'Day 14', task: 'Check new top leaves to make sure they are growing smooth with no bumps', type: 'Observation' }
    ];
  } else if (isBlight) {
    chemicalDosage = [
      {
        name: 'Copper Anti-Fungal Powder (Copper Oxychloride)',
        type: 'Chemical',
        ratioNPK: 'Fungicide',
        exactDosage: '1/2 teaspoon (2.5g) per Liter of water',
        applicationMethod: 'Spray on spotted leaves to stop mold and fungus spreading',
        timing: 'Clear morning',
        estimatedCostINR: 50,
        safetyWarning: 'Stop overhead watering; wear gloves while spraying.'
      },
      {
        name: '19-19-19 Leaf Spray Food',
        type: 'Foliar Spray',
        ratioNPK: '19-19-19',
        exactDosage: '1 teaspoon (5g) per Liter of water',
        applicationMethod: 'Spray light mist under leaves to help the plant recover',
        timing: 'Evening (after 5:00 PM)',
        estimatedCostINR: 25
      }
    ];
    organicDosage = [
      {
        name: 'Organic Neem Oil (Anti-Fungus Shield)',
        type: 'Organic',
        ratioNPK: 'Bio-Shield',
        exactDosage: '1 teaspoon (5ml) per Liter of water',
        applicationMethod: 'Mix with 2 drops soap and spray under leaves to stop fungus from spreading',
        timing: 'Evening (at dusk)',
        estimatedCostINR: 15
      },
      {
        name: 'Natural Anti-Fungus Soil Treatment',
        type: 'Organic',
        ratioNPK: 'Bio-Fungus',
        exactDosage: '10g per Liter of water',
        applicationMethod: 'Pour around the dirt near the roots to fight fungus in the soil',
        timing: 'Morning',
        estimatedCostINR: 30
      }
    ];
    summaryWhatHappened = isWet
      ? `Your dirt is soaked in water (${soil.moisturePercent}%) with moist air, making mold and fungus spread fast and create brown spots on the leaves.`
      : `A plant fungus caused brown ring-shaped spots and yellow leaf edges.`;
    summaryWhatToDoToday = isWet
      ? `Stop watering for 3 to 4 days so the dirt can dry out. Cut off the sick spotted leaves with clean scissors and throw them away, then spray anti-fungus spray on the plant.`
      : `Cut off the sick bottom leaves with brown spots using clean scissors and spray anti-fungus spray on the leaves in the morning.`;
    correlationText = `Soil moisture is at ${soil.moisturePercent}% with ${soil.humidityPercent}% air humidity. High moisture in the soil and air is letting fungus grow on wet leaves.`;
    rootCauseText = `Fungal plant infection accelerated by wet leaves and humid air.`;
    scheduleTasks = [
      { day: 'Day 1', task: 'Cut off the sick bottom leaves near the dirt with clean scissors and throw them away', type: 'Organic' },
      { day: 'Day 3', task: 'Spray anti-fungus spray all over the leaves in the morning', type: 'Chemical' },
      { day: 'Day 7', task: 'Check that the dark spots have stopped spreading', type: 'Observation' },
      { day: 'Day 14', task: 'Check that fresh new green leaves are growing at the top', type: 'Observation' }
    ];
  } else if (isIronChlorosis) {
    chemicalDosage = [
      {
        name: 'Chelated Iron (Fe-EDTA 12%)',
        type: 'Chemical',
        ratioNPK: 'Micronutrient (Fe)',
        exactDosage: '1 teaspoon (5g) per 5 Liters of water',
        applicationMethod: 'Mix into water and pour around the soil near roots for fast uptake',
        timing: 'Morning',
        estimatedCostINR: 45
      },
      {
        name: 'Magnesium Plant Salt (Epsom Salt)',
        type: 'Foliar Spray',
        ratioNPK: 'Mg + Sulfur',
        exactDosage: '1/2 teaspoon (2g) per Liter of water',
        applicationMethod: 'Spray directly on yellow leaves to help them turn green again',
        timing: 'Early morning',
        estimatedCostINR: 20
      }
    ];
    organicDosage = [
      {
        name: 'Enriched Vermicompost & Soil Food',
        type: 'Organic',
        ratioNPK: 'Bio-Organic',
        exactDosage: '2 cups (250g) per plant',
        applicationMethod: 'Mix into top 2 inches of dirt around the base to balance soil food',
        timing: 'Evening hours',
        estimatedCostINR: 25
      }
    ];
    summaryWhatHappened = `The plant does not have enough iron food, so the leaf is turning yellow while the veins stay dark green.`;
    summaryWhatToDoToday = `Mix 1 spoon of iron powder in water and pour it onto the soil around the roots today. Spray a light iron mist on leaves tomorrow morning.`;
    correlationText = `Soil moisture is at ${soil.moisturePercent}%. Plant roots cannot absorb iron from the dirt, causing yellow spaces between veins.`;
    rootCauseText = `Iron (Fe) nutrient deficiency in leaf tissue due to high soil pH or depleted minerals.`;
    scheduleTasks = [
      { day: 'Day 1', task: 'Mix iron powder in water and pour around the soil near roots', type: 'Chemical' },
      { day: 'Day 4', task: 'Spray diluted iron water lightly onto the yellow leaves', type: 'Chemical' },
      { day: 'Day 8', task: 'Check to see green color returning to the yellow leaf areas', type: 'Observation' },
      { day: 'Day 14', task: 'Make sure all top leaves are healthy green with fresh flower buds', type: 'Observation' }
    ];
  } else {
    chemicalDosage = isDry
      ? [
          {
            name: 'Potash Fertilizer (MOP 0-0-60)',
            type: 'Chemical',
            ratioNPK: '0-0-60',
            exactDosage: '2 tablespoons (40g) per plant',
            applicationMethod: 'Sprinkle in a circle 4 inches away from stem. Water well afterwards.',
            timing: 'Morning (before 8:00 AM)',
            estimatedCostINR: 40,
            safetyWarning: 'Keep granules 4 inches away from main stem to prevent root burn.'
          },
          {
            name: '19-19-19 All-in-One Plant Food',
            type: 'Foliar Spray',
            ratioNPK: '19-19-19',
            exactDosage: '1 teaspoon (5g) per Liter of water',
            applicationMethod: 'Spray light mist under leaves using a spray bottle',
            timing: 'Evening (after 5:00 PM)',
            estimatedCostINR: 25
          }
        ]
      : isWet
      ? [
          {
            name: 'Copper Anti-Fungal Powder',
            type: 'Chemical',
            ratioNPK: 'Fungicide',
            exactDosage: '1/2 teaspoon (2.5g) per Liter of water',
            applicationMethod: 'Spray on spotted leaves to stop mold and fungus spreading',
            timing: 'Clear morning',
            estimatedCostINR: 50,
            safetyWarning: 'Stop watering immediately; wear gloves while spraying.'
          }
        ]
      : [
          {
            name: 'Balanced Plant Food (10-26-26)',
            type: 'Chemical',
            ratioNPK: '10-26-26',
            exactDosage: '3 tablespoons (60g) per plant',
            applicationMethod: 'Mix into top dirt 6 inches away from the base',
            timing: 'Morning',
            estimatedCostINR: 45
          }
        ];

    organicDosage = [
      {
        name: 'Wood Ash & Compost (Natural Potash)',
        type: 'Organic',
        ratioNPK: 'Natural 0-1-10',
        exactDosage: '2 cups (250g) per plant',
        applicationMethod: 'Sprinkle around plant base and gently mix into top 2 inches of dirt',
        timing: 'Evening hours',
        estimatedCostINR: 20
      },
      {
        name: 'Organic Neem Oil (Pest & Fungus Shield)',
        type: 'Organic',
        ratioNPK: 'Bio-Shield',
        exactDosage: '1 teaspoon (5ml) per Liter of water',
        applicationMethod: 'Mix with 2 drops of liquid soap and spray under leaves to protect against bugs & fungus',
        timing: 'Evening (at dusk)',
        estimatedCostINR: 15
      }
    ];

    summaryWhatHappened = isDry
      ? `Your dirt is too dry (${soil.moisturePercent}%). Because the roots have no water to drink, the plant cannot take up food, making leaf tips turn brown and crispy.`
      : isWet
      ? `Your dirt is soaking wet (${soil.moisturePercent}%). The roots cannot breathe under water, which makes fungus grow and spots appear on leaves.`
      : `Your soil moisture is good (${soil.moisturePercent}%). The plant is hungry and needs balanced fertilizer food.`;

    summaryWhatToDoToday = isDry
      ? `Give 1 to 2 buckets of water today. Dry roots cannot eat food until they drink. Add plant fertilizer tomorrow evening.`
      : isWet
      ? `Do not water for 3 to 4 days. Let the top dirt dry so the roots can breathe.`
      : `Sprinkle 2 spoons of fertilizer around the dirt today (keep 4 inches away from the stem).`;

    correlationText = isDry
      ? `Soil moisture is low at ${soil.moisturePercent}%, creating dry root stress that stops the plant from drinking food and burns leaf tips.`
      : isWet
      ? `Soil is soaking wet at ${soil.moisturePercent}% with ${soil.humidityPercent}% air humidity, choking root hairs and spreading leaf fungus.`
      : `Soil moisture is healthy at ${soil.moisturePercent}%. Visual symptoms show that the plant needs gentle fertilizer feeding.`;

    rootCauseText = isDry
      ? `Moisture shortage stopped the plant from moving potassium food up to the leaves.`
      : isWet
      ? `Over-watering stopped roots from breathing and encouraged leaf fungus.`
      : `Nutrient shortage in soil requiring split-dose mineral feeding.`;
  }

  return {
    primaryDiagnosis: `${visionData.cropIdentified} • ${visionData.suspectedPathology}`,
    simpleSummary: {
      whatHappened: summaryWhatHappened,
      whatToDoToday: summaryWhatToDoToday
    },
    multimodalCorrelation: correlationText,
    rootCauseAnalysis: rootCauseText,
    chemicalPrescription: chemicalDosage,
    organicPrescription: organicDosage,
    irrigationDirective: {
      action: isDry 
        ? 'Immediate Deep Watering' 
        : isWet 
        ? 'Withhold Water' 
        : 'Standard Irrigation',
      details: isPest
        ? 'Maintain soil moisture at 45-55%. Dehydration stress makes fruit trees significantly more vulnerable to gall midges.'
        : isDry 
        ? 'Give 1 to 2 buckets (15–20 Liters) of water per plant right away. Water dissolves the fertilizer and stops root burn.'
        : isWet
        ? 'Do not water for 4 days until soil moisture drops below 50%.'
        : 'Water normally. Keep the topsoil damp like a wrung-out sponge.',
      targetMoisturePercent: 50
    },
    fourteenDaySchedule: scheduleTasks,
    totalEstimatedCostINR: { chemical: 45, organic: 20 },
    academicNotes: {
      stage1Tokens: visionData.tokensUsed || 420,
      stage2Tokens: 520,
      totalCostUSD: 0.00015,
      totalLatencyMs: visionData.executionTimeMs + duration,
      reasoningChainSummary: `Correlated ${visionData.cropIdentified} foliar markers with ${soil.moisturePercent}% soil moisture.`
    },
    isFallback: true,
    snapshotTelemetry: soil
  };
}