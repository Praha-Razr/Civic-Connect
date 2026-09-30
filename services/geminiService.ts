
import { GoogleGenAI, Type } from "@google/genai";
import { IssueCategory, IssuePriority, IssueStatus, Grievance, ActionSuggestion, Location, AdminAIAnalysis, TalukBudgetAdvisory, PolicySimulation } from "../types";

/**
 * Robustly extracts and parses JSON from a string that might contain Markdown or conversational text.
 */
function safeJsonParse(text: string): any {
  if (!text) return {};
  const trimmed = text.trim();
  
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch (e2) {}
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const candidate = trimmed.substring(firstBrace, lastBrace + 1);
        return JSON.parse(candidate);
      } catch (e3) {}
    }

    console.error("JSON Parsing failed for text:", trimmed);
    throw new Error(`Failed to extract valid JSON from response.`);
  }
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelay = 500): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isTransient = error instanceof Error && 
        (error.message.includes('500') || error.message.includes('fetch') || error.message.includes('quota'));
      if (!isTransient || attempt === maxRetries - 1) break; 
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export const aiService = {
  async categorizeIssue(description: string, location?: Location | null): Promise<{ category: IssueCategory; priority: IssuePriority; reasoning: string }> {
    const performCategorization = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const locationContext = location ? `User Location: Lat ${location.latitude}, Lng ${location.longitude}.` : "";
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `STRICT JSON OUTPUT ONLY. ${locationContext} Review this civic grievance description: "${description}". 
        Select a category from: ${Object.values(IssueCategory).join(", ")}.
        Assign priority: Low, Medium, High, or Critical.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["category", "priority", "reasoning"],
          },
        },
      });
      const result = safeJsonParse(response.text);
      return {
        category: Object.values(IssueCategory).find(c => c.toLowerCase() === (result.category || "").toLowerCase()) || IssueCategory.OTHERS,
        priority: Object.values(IssuePriority).find(p => p.toLowerCase() === (result.priority || "").toLowerCase()) || IssuePriority.MEDIUM,
        reasoning: result.reasoning || "Standard AI Review."
      };
    };
    return await withRetry(performCategorization);
  },

  async detectSmartMerge(newIssue: { title: string, description: string, location: Location, category: IssueCategory }, existingIssues: Grievance[]): Promise<{ isDuplicate: boolean, parentId?: string, reasoning: string }> {
    const performMergeCheck = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const candidates = existingIssues
        .filter(g => g.category === newIssue.category && g.status !== IssueStatus.RESOLVED)
        .slice(0, 10);
        
      if (candidates.length === 0) {
        return { isDuplicate: false, reasoning: "No active reports found in this category." };
      }

      const candidatesContext = candidates.map(c => `ID: ${c.id} | Title: ${c.title} | Desc: ${c.description}`).join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `STRICT JSON OUTPUT ONLY. Duplicate Detection Engine.
        Assess if the new report is a duplicate of any existing reports. 
        Focus on semantic similarity and location intent.
        
        New Report:
        Title: ${newIssue.title}
        Description: ${newIssue.description}
        Category: ${newIssue.category}
        
        Existing Reports:
        ${candidatesContext}
        
        Return JSON with isDuplicate (boolean), parentId (string ID or null), and reasoning (string).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDuplicate: { type: Type.BOOLEAN },
              parentId: { type: Type.STRING, nullable: true },
              reasoning: { type: Type.STRING }
            },
            required: ["isDuplicate", "reasoning"]
          }
        }
      });
      
      const result = safeJsonParse(response.text);
      return {
        isDuplicate: !!result.isDuplicate,
        parentId: result.parentId || undefined,
        reasoning: result.reasoning || "Semantic similarity detected."
      };
    };
    return await withRetry(performMergeCheck);
  },

  async analyzeCaseForAdmin(grievance: Grievance): Promise<AdminAIAnalysis> {
    const performAnalysis = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `STRICT JSON OUTPUT ONLY. SLA GUARDIAN™ & RISK ANALYSIS:
        ID: ${grievance.id} | Narrative: ${grievance.description} | Created: ${grievance.createdAt}
        Predict if this case will violate its 7-day SLA. Provide Risk Score, Resolution Hours, Justification, Complexity, and SLA Status (on-track, at-risk, violation).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              fraudDetectionReasoning: { type: Type.STRING },
              predictedResolutionHours: { type: Type.NUMBER },
              priorityJustification: { type: Type.STRING },
              resourceComplexity: { type: Type.STRING },
              slaStatus: { type: Type.STRING }
            },
            required: ["riskScore", "fraudDetectionReasoning", "predictedResolutionHours", "priorityJustification", "resourceComplexity", "slaStatus"]
          }
        }
      });
      return safeJsonParse(response.text);
    };
    return await withRetry(performAnalysis);
  },

  async getTalukStrategicAdvice(talukData: string): Promise<{ recommendations: { title: string, description: string, target: string }[] }> {
    const performAdviceGen = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `STRICT JSON OUTPUT ONLY. TALUK STRATEGIC ADVISOR:
        Review this Taluk telemetry summary:
        "${talukData}"
        
        Generate 3 high-impact strategic recommendations for the Taluk Officer. Each recommendation must focus on a specific village or issue type surging in frequency.
        Provide title, description, and target (the village or category).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    target: { type: Type.STRING }
                  },
                  required: ["title", "description", "target"]
                }
              }
            },
            required: ["recommendations"]
          }
        }
      });
      return safeJsonParse(response.text);
    };
    return await withRetry(performAdviceGen);
  },

  async simulatePolicyImpact(scenario: string): Promise<PolicySimulation> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `STRICT JSON OUTPUT ONLY. POLICY IMPACT SIMULATOR™:
      Scenario: "${scenario}"
      Predict the outcome on Tamil Nadu's municipal efficiency. Provide: expected improvement narrative, cost-benefit ratio, satisfaction delta (0-100), and risk assessment.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            expectedImprovement: { type: Type.STRING },
            costBenefitRatio: { type: Type.STRING },
            satisfactionDelta: { type: Type.NUMBER },
            riskAssessment: { type: Type.STRING }
          },
          required: ["expectedImprovement", "costBenefitRatio", "satisfactionDelta", "riskAssessment"]
        }
      }
    });
    return safeJsonParse(response.text);
  },

  async getActionSuggestions(grievance: Grievance): Promise<ActionSuggestion> {
    const performSuggestions = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `STRICT JSON OUTPUT ONLY. ACTION PLAN:
        Title: ${grievance.title} | Category: ${grievance.category}
        Suggest: Department, Manpower, 4-step plan, Estimated hours.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              department: { type: Type.STRING },
              manpower: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              estimatedHours: { type: Type.NUMBER }
            },
            required: ["department", "manpower", "steps", "estimatedHours"]
          }
        }
      });
      return safeJsonParse(response.text);
    };
    return await withRetry(performSuggestions);
  },

  async chatAssistant(query: string, location?: Location | null): Promise<{ suggestion: string, autoFill: Partial<Grievance> }> {
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `STRICT JSON OUTPUT ONLY. Help a citizen report a civic issue. User says: "${query}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestion: { type: Type.STRING },
              autoFill: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  priority: { type: Type.STRING }
                }
              }
            },
            required: ["suggestion", "autoFill"]
          }
        }
     });
     return safeJsonParse(response.text);
  }
};
