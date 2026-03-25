import { invokeLLM } from "../_core/llm";
import type { ScrapedWebsite } from "./scraper";

export interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  sentiment: "positive" | "neutral" | "negative";
  score: number; // 0-10
  summary: string;
}

/**
 * Analyze a scraped website using AI to identify strengths, weaknesses, and improvements
 */
export async function analyzeWebsite(website: ScrapedWebsite): Promise<AnalysisResult> {
  const websiteContent = `
Website Title: ${website.title}
Description: ${website.description}

Sections Found:
${website.sections.map((s) => `- ${s.type}: ${s.content}`).join("\n")}

Metadata:
- Language: ${website.metadata.language || "Not specified"}
- Charset: ${website.metadata.charset || "Not specified"}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert web design and UX analyst. Analyze the provided website content and provide a detailed assessment of its strengths, weaknesses, and improvement opportunities. Be specific and actionable in your recommendations.`,
      },
      {
        role: "user",
        content: `Please analyze this website and provide:
1. 3-5 key strengths
2. 3-5 key weaknesses
3. 3-5 specific improvement recommendations
4. Overall sentiment (positive/neutral/negative)
5. Overall quality score (0-10)
6. A brief summary

Website content:
${websiteContent}

Respond in JSON format with keys: strengths, weaknesses, improvements, sentiment, score, summary`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "website_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "Key strengths of the website",
            },
            weaknesses: {
              type: "array",
              items: { type: "string" },
              description: "Key weaknesses of the website",
            },
            improvements: {
              type: "array",
              items: { type: "string" },
              description: "Specific improvement recommendations",
            },
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
              description: "Overall sentiment about the website",
            },
            score: {
              type: "number",
              minimum: 0,
              maximum: 10,
              description: "Overall quality score",
            },
            summary: {
              type: "string",
              description: "Brief summary of the analysis",
            },
          },
          required: ["strengths", "weaknesses", "improvements", "sentiment", "score", "summary"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const analysisContent = response.choices[0]?.message.content;
    if (!analysisContent) throw new Error("No response from LLM");

    const contentStr = typeof analysisContent === "string" ? analysisContent : JSON.stringify(analysisContent);
    const parsed = JSON.parse(contentStr);

    return {
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      sentiment: parsed.sentiment || "neutral",
      score: typeof parsed.score === "number" ? Math.min(10, Math.max(0, parsed.score)) : 5,
      summary: parsed.summary || "Analysis complete",
    };
  } catch (error) {
    console.error("Failed to parse analysis response:", error);
    throw new Error("Failed to analyze website");
  }
}

/**
 * Generate AI-powered improvements for website sections
 */
export async function generateSectionImprovements(
  sectionType: string,
  content: string
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert web designer and copywriter. Your task is to improve website sections with better design suggestions, copy, and layout recommendations.`,
      },
      {
        role: "user",
        content: `Please provide specific improvements for this ${sectionType} section:

Current content:
${content}

Provide actionable suggestions for:
1. Better copywriting and messaging
2. Improved visual hierarchy
3. Better call-to-action placement
4. Enhanced user engagement elements
5. Mobile responsiveness considerations`,
      },
    ],
  });

  const improvementContent = response.choices[0]?.message.content;
  return typeof improvementContent === "string" ? improvementContent : JSON.stringify(improvementContent) || "No improvements generated";


}
