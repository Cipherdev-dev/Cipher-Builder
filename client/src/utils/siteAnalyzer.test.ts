import { describe, it, expect } from "vitest";
import { analyzeSite, isValidUrl, extractDomain, generateRebuildCopy } from "./siteAnalyzer";

describe("Site Analyzer - V4.2", () => {
  it("should analyze a barbershop URL and return structured results with scores", async () => {
    const result = await analyzeSite("joesbarbershop.com");

    expect(result).toHaveProperty("businessName");
    expect(result).toHaveProperty("services");
    expect(result).toHaveProperty("tone");
    expect(result).toHaveProperty("sections");
    expect(result).toHaveProperty("issues");
    expect(result).toHaveProperty("performanceScore");
    expect(result).toHaveProperty("seoScore");
    expect(result).toHaveProperty("conversionScore");
    expect(result).toHaveProperty("confidenceScore");
    expect(result).toHaveProperty("expectedImprovement");

    // Verify business name parsing
    expect(result.businessName).toContain("Barbershop");

    // Verify scores are in realistic range (40-90)
    expect(result.performanceScore).toBeGreaterThanOrEqual(40);
    expect(result.performanceScore).toBeLessThanOrEqual(90);
    expect(result.seoScore).toBeGreaterThanOrEqual(40);
    expect(result.seoScore).toBeLessThanOrEqual(90);
    expect(result.conversionScore).toBeGreaterThanOrEqual(40);
    expect(result.conversionScore).toBeLessThanOrEqual(90);

    // Verify confidence score
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);

    // Verify improvement expectation
    expect(result.expectedImprovement).toMatch(/\d+%/);
    expect(result.expectedImprovement).toContain("conversion increase");

    // Verify realistic issues
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.toLowerCase().includes("booking"))).toBe(true);
  });

  it("should parse business names correctly", async () => {
    const testCases = [
      { url: "joesbarbershop.com", expected: "Joe's Barbershop" },
      { url: "smithplumbing.com", expected: "Smith Plumbing" },
      { url: "acme-consulting.com", expected: "Acme Consulting" },
    ];

    for (const testCase of testCases) {
      const result = await analyzeSite(testCase.url);
      expect(result.businessName).toBe(testCase.expected);
    }
  });

  it("should generate realistic scores with proper ranges", async () => {
    const result = await analyzeSite("restaurant.com");

    // All scores should be in 40-90 range
    expect(result.performanceScore).toBeGreaterThanOrEqual(40);
    expect(result.performanceScore).toBeLessThanOrEqual(90);
    expect(result.seoScore).toBeGreaterThanOrEqual(40);
    expect(result.seoScore).toBeLessThanOrEqual(90);
    expect(result.conversionScore).toBeGreaterThanOrEqual(40);
    expect(result.conversionScore).toBeLessThanOrEqual(90);
  });

  it("should return business-specific issues", async () => {
    const result = await analyzeSite("salon.com");

    expect(result.issues.length).toBeGreaterThan(0);
    // Issues should be realistic and business-specific
    expect(result.issues.some((issue) => !issue.includes("generic"))).toBe(true);
  });

  it("should generate premium rebuild copy", () => {
    const copy = generateRebuildCopy("Joe's Barbershop", ["Haircuts", "Beard Trim"], "local professional");

    expect(copy).toHaveProperty("heroHeadline");
    expect(copy).toHaveProperty("heroSubtitle");
    expect(copy).toHaveProperty("ctaPrimary");
    expect(copy).toHaveProperty("ctaSecondary");

    // Verify copy is not empty
    expect(copy.heroHeadline.length).toBeGreaterThan(0);
    expect(copy.heroSubtitle.length).toBeGreaterThan(0);
    expect(copy.ctaPrimary.length).toBeGreaterThan(0);
  });

  it("should validate URLs correctly", () => {
    expect(isValidUrl("example.com")).toBe(true);
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("")).toBe(false);
  });

  it("should extract domain from URLs", () => {
    expect(extractDomain("example.com")).toBe("example.com");
    expect(extractDomain("https://www.example.com")).toBe("example.com");
    expect(extractDomain("www.example.com")).toBe("example.com");
  });

  it("should calculate confidence score based on current metrics", async () => {
    const result = await analyzeSite("fitness.com");

    // Confidence should be inverse of average score (lower current = higher confidence in improvement)
    const average = (result.performanceScore + result.seoScore + result.conversionScore) / 3;
    const expectedConfidence = Math.round(100 - average / 2);

    // Allow some variance due to randomization
    expect(Math.abs(result.confidenceScore - expectedConfidence)).toBeLessThan(20);
  });
});
