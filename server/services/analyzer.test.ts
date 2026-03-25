import { describe, it, expect, vi } from "vitest";
import { analyzeWebsite } from "./analyzer";
import type { ScrapedWebsite } from "./scraper";

// Mock the LLM with proper implementation
vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            strengths: ["Good design", "Fast loading"],
            weaknesses: ["Poor SEO", "Mobile issues"],
            improvements: ["Add mobile optimization", "Improve SEO"],
            sentiment: "neutral",
            score: 6.5,
            summary: "Website needs improvements",
          }),
        },
      },
    ],
  }),
}));

describe("Website Analyzer", () => {
  it(
    "should analyze a website and return structured results",
    async () => {
      const mockWebsite: ScrapedWebsite = {
        url: "https://example.com",
        title: "Example Website",
        description: "An example website",
        sections: [
          {
            type: "header",
            content: "Header content",
            html: "<header>Header</header>",
          },
          {
            type: "hero",
            content: "Hero content",
            html: "<section>Hero</section>",
          },
        ],
        metadata: {
          language: "en",
          charset: "utf-8",
        },
      };

      const result = await analyzeWebsite(mockWebsite);

      expect(result).toHaveProperty("strengths");
      expect(result).toHaveProperty("weaknesses");
      expect(result).toHaveProperty("improvements");
      expect(result).toHaveProperty("sentiment");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("summary");

      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.weaknesses)).toBe(true);
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(["positive", "neutral", "negative"]).toContain(result.sentiment);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(10);
    },
    { timeout: 10000 }
  );

  it(
    "should handle empty sections gracefully",
    async () => {
      const mockWebsite: ScrapedWebsite = {
        url: "https://example.com",
        title: "Example",
        description: "Example",
        sections: [],
        metadata: {},
      };

      const result = await analyzeWebsite(mockWebsite);

      expect(result.strengths).toBeDefined();
      expect(result.weaknesses).toBeDefined();
      expect(result.improvements).toBeDefined();
    },
    { timeout: 10000 }
  );
});
