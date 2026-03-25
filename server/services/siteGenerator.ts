import { invokeLLM } from "../_core/llm";
import type { Section } from "../../drizzle/schema";

export interface GeneratedSite {
  html: string;
  css: string;
  title: string;
  description: string;
}

/**
 * Generate a complete website from a prompt
 */
export async function generateSiteFromPrompt(
  prompt: string,
  industry?: string,
  style?: string
): Promise<GeneratedSite> {
  const styleGuide = style
    ? `Design style: ${style}`
    : "Design style: modern, clean, professional";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert web designer and developer. Generate complete, production-ready HTML and CSS for websites based on user prompts. Always create responsive, accessible, and modern websites.`,
      },
      {
        role: "user",
        content: `Generate a complete website based on this prompt:

${prompt}

Industry: ${industry || "General"}
${styleGuide}

Requirements:
1. Create a complete HTML structure with semantic HTML5
2. Include responsive CSS with mobile-first approach
3. Add a header with navigation
4. Create a hero section
5. Add features/services section
6. Include testimonials section
7. Add a footer with contact info
8. Make it visually appealing and professional
9. Include proper spacing, typography, and colors

Return a JSON object with:
- html: Complete HTML code
- css: Complete CSS code
- title: Website title
- description: Website description

Make sure the HTML includes a <style> tag with the CSS embedded.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generated_site",
        strict: true,
        schema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "Complete HTML code for the website",
            },
            css: {
              type: "string",
              description: "Complete CSS code for styling",
            },
            title: {
              type: "string",
              description: "Website title",
            },
            description: {
              type: "string",
              description: "Website description",
            },
          },
          required: ["html", "css", "title", "description"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const responseContent = response.choices[0]?.message.content;
    if (!responseContent) throw new Error("No response from LLM");

    const contentStr =
      typeof responseContent === "string"
        ? responseContent
        : JSON.stringify(responseContent);
    const parsed = JSON.parse(contentStr);

    return {
      html: parsed.html || "",
      css: parsed.css || "",
      title: parsed.title || "Generated Website",
      description: parsed.description || "A generated website",
    };
  } catch (error) {
    console.error("Failed to parse site generation response:", error);
    throw new Error("Failed to generate website");
  }
}

/**
 * Rebuild a website based on analysis findings and selected sections
 */
export async function rebuildSiteFromSections(
  sections: Section[],
  analysis?: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  }
): Promise<GeneratedSite> {
  const sectionsContent = sections
    .map(
      (s) => `
Section Type: ${s.sectionType}
Title: ${s.title || ""}
Content: ${s.content || ""}
`
    )
    .join("\n");

  const improvementsText = analysis
    ? `
Improvements to implement:
${analysis.improvements.map((i) => `- ${i}`).join("\n")}

Strengths to maintain:
${analysis.strengths.map((s) => `- ${s}`).join("\n")}

Weaknesses to address:
${analysis.weaknesses.map((w) => `- ${w}`).join("\n")}
`
    : "";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert web designer and developer. Your task is to rebuild websites using provided sections and analysis findings. Create improved, modern, and responsive websites.`,
      },
      {
        role: "user",
        content: `Rebuild a website using these sections and improvements:

${sectionsContent}

${improvementsText}

Create:
1. A complete HTML structure using the provided sections
2. Modern, responsive CSS styling
3. Improved layout and design based on the analysis
4. Better typography, spacing, and visual hierarchy
5. Mobile-first responsive design
6. Professional color scheme

Return a JSON object with:
- html: Complete HTML code
- css: Complete CSS code
- title: Website title
- description: Website description`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "rebuilt_site",
        strict: true,
        schema: {
          type: "object",
          properties: {
            html: {
              type: "string",
              description: "Complete HTML code for the rebuilt website",
            },
            css: {
              type: "string",
              description: "Complete CSS code for styling",
            },
            title: {
              type: "string",
              description: "Website title",
            },
            description: {
              type: "string",
              description: "Website description",
            },
          },
          required: ["html", "css", "title", "description"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const responseContent = response.choices[0]?.message.content;
    if (!responseContent) throw new Error("No response from LLM");

    const contentStr =
      typeof responseContent === "string"
        ? responseContent
        : JSON.stringify(responseContent);
    const parsed = JSON.parse(contentStr);

    return {
      html: parsed.html || "",
      css: parsed.css || "",
      title: parsed.title || "Rebuilt Website",
      description: parsed.description || "A rebuilt website",
    };
  } catch (error) {
    console.error("Failed to parse site rebuild response:", error);
    throw new Error("Failed to rebuild website");
  }
}
