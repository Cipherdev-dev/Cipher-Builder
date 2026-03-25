import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedSection {
  type: "header" | "hero" | "features" | "testimonials" | "footer";
  title?: string;
  content: string;
  html: string;
}

export interface ScrapedWebsite {
  url: string;
  title: string;
  description: string;
  sections: ScrapedSection[];
  metadata: {
    language?: string;
    charset?: string;
    viewport?: string;
  };
}

/**
 * Scrape a website and extract key sections
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // Fetch the website
    const response = await axios.get(normalizedUrl, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $("title").text() || $('meta[property="og:title"]').attr("content") || "";
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    const sections: ScrapedSection[] = [];

    // Extract header/navigation
    const header = extractHeader($);
    if (header) sections.push(header);

    // Extract hero section
    const hero = extractHero($);
    if (hero) sections.push(hero);

    // Extract features section
    const features = extractFeatures($);
    if (features) sections.push(features);

    // Extract testimonials
    const testimonials = extractTestimonials($);
    if (testimonials) sections.push(testimonials);

    // Extract footer
    const footer = extractFooter($);
    if (footer) sections.push(footer);

    return {
      url: normalizedUrl,
      title,
      description,
      sections,
      metadata: {
        language: $("html").attr("lang"),
        charset: $('meta[charset]').attr("charset"),
        viewport: $('meta[name="viewport"]').attr("content"),
      },
    };
  } catch (error) {
    console.error("Scraping error:", error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function extractHeader($: cheerio.CheerioAPI): ScrapedSection | null {
  const header = $("header").first();
  if (header.length === 0) return null;

  const html = header.html() || "";
  const text = header.text().trim();

  if (!text) return null;

  return {
    type: "header",
    title: "Header",
    content: text.substring(0, 500),
    html: html.substring(0, 2000),
  };
}

function extractHero($: cheerio.CheerioAPI): ScrapedSection | null {
  // Look for common hero section patterns
  let hero = $(".hero").first();
  if (hero.length === 0) hero = $(".banner").first();
  if (hero.length === 0) hero = $("[class*='hero']").first();
  if (hero.length === 0) hero = $("section").first();

  if (hero.length === 0) return null;

  const html = hero.html() || "";
  const text = hero.text().trim();

  if (!text) return null;

  return {
    type: "hero",
    title: "Hero Section",
    content: text.substring(0, 500),
    html: html.substring(0, 3000),
  };
}

function extractFeatures($: cheerio.CheerioAPI): ScrapedSection | null {
  // Look for features section
  let features = $(".features").first();
  if (features.length === 0) features = $("[class*='feature']").first();
  if (features.length === 0) features = $("[class*='service']").first();

  if (features.length === 0) return null;

  const html = features.html() || "";
  const text = features.text().trim();

  if (!text) return null;

  return {
    type: "features",
    title: "Features",
    content: text.substring(0, 500),
    html: html.substring(0, 3000),
  };
}

function extractTestimonials($: cheerio.CheerioAPI): ScrapedSection | null {
  // Look for testimonials/reviews section
  let testimonials = $(".testimonials").first();
  if (testimonials.length === 0) testimonials = $("[class*='testimonial']").first();
  if (testimonials.length === 0) testimonials = $("[class*='review']").first();

  if (testimonials.length === 0) return null;

  const html = testimonials.html() || "";
  const text = testimonials.text().trim();

  if (!text) return null;

  return {
    type: "testimonials",
    title: "Testimonials",
    content: text.substring(0, 500),
    html: html.substring(0, 3000),
  };
}

function extractFooter($: cheerio.CheerioAPI): ScrapedSection | null {
  const footer = $("footer").first();
  if (footer.length === 0) return null;

  const html = footer.html() || "";
  const text = footer.text().trim();

  if (!text) return null;

  return {
    type: "footer",
    title: "Footer",
    content: text.substring(0, 500),
    html: html.substring(0, 2000),
  };
}
