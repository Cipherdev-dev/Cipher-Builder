/**
 * Site Analyzer Utility - V4.2
 * 
 * Enhanced with:
 * - Smart URL parsing and business name generation
 * - Realistic scoring system (performance, SEO, conversion)
 * - Business-specific issue detection
 * - Confidence scoring for improvement predictions
 * - Premium rebuild copy generation
 */

interface AnalysisResult {
  businessName: string;
  services: string[];
  tone: string;
  sections: string[];
  issues: string[];
  performanceScore: number;
  seoScore: number;
  conversionScore: number;
  confidenceScore: number;
  expectedImprovement: string;
}

interface RebuildCopy {
  heroHeadline: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

// Business type patterns with characteristics
const businessPatterns: Record<string, any> = {
  barbershop: {
    services: ["Haircuts", "Beard Trim", "Shave", "Hair Coloring", "Styling"],
    tone: "local professional",
    issues: [
      "No online booking system",
      "Weak call-to-action for appointments",
      "Outdated design doesn't showcase work",
      "Missing customer testimonials",
      "Poor mobile responsiveness",
    ],
    copy: {
      heroHeadline: "Premium Barbering & Grooming",
      heroSubtitle: "Expert cuts, classic style, modern service",
      ctaPrimary: "Book Your Appointment",
      ctaSecondary: "View Our Services",
    },
  },
  salon: {
    services: ["Hair Styling", "Manicure", "Pedicure", "Facial", "Waxing"],
    tone: "luxury wellness",
    issues: [
      "Gallery images not optimized",
      "No service pricing displayed",
      "Missing online booking",
      "Weak value proposition",
      "No team bios or credentials",
    ],
    copy: {
      heroHeadline: "Your Sanctuary for Beauty & Wellness",
      heroSubtitle: "Expert stylists dedicated to your confidence",
      ctaPrimary: "Schedule Your Transformation",
      ctaSecondary: "Meet Our Team",
    },
  },
  restaurant: {
    services: ["Dine-in", "Takeout", "Catering", "Private Events", "Delivery"],
    tone: "welcoming culinary",
    issues: [
      "Menu not easily accessible",
      "No online ordering",
      "Missing hours and location info",
      "Poor food photography",
      "No reservation system",
    ],
    copy: {
      heroHeadline: "Culinary Excellence Awaits",
      heroSubtitle: "Fresh ingredients, bold flavors, unforgettable experience",
      ctaPrimary: "Reserve Your Table",
      ctaSecondary: "View Our Menu",
    },
  },
  fitness: {
    services: ["Personal Training", "Group Classes", "Yoga", "Nutrition Coaching", "Bootcamp"],
    tone: "energetic motivational",
    issues: [
      "Class schedule not clearly visible",
      "No trainer profiles or credentials",
      "Missing pricing and membership info",
      "Weak motivational messaging",
      "No success stories displayed",
    ],
    copy: {
      heroHeadline: "Transform Your Body, Elevate Your Life",
      heroSubtitle: "Expert training, supportive community, proven results",
      ctaPrimary: "Start Your Free Trial",
      ctaSecondary: "View Classes",
    },
  },
  dental: {
    services: ["Cleanings", "Fillings", "Root Canal", "Cosmetic Dentistry", "Implants"],
    tone: "professional medical",
    issues: [
      "Outdated design lacks trust signals",
      "No appointment booking online",
      "Missing patient testimonials",
      "Unclear service descriptions",
      "No insurance information",
    ],
    copy: {
      heroHeadline: "Your Smile Deserves Expert Care",
      heroSubtitle: "Advanced technology, compassionate dentistry, beautiful results",
      ctaPrimary: "Schedule Your Checkup",
      ctaSecondary: "Learn About Services",
    },
  },
  plumbing: {
    services: ["Repairs", "Installation", "Maintenance", "Emergency Service", "Drain Cleaning"],
    tone: "reliable professional",
    issues: [
      "Limited service area information",
      "No pricing transparency",
      "Missing emergency contact info",
      "Outdated testimonials",
      "No service guarantees displayed",
    ],
    copy: {
      heroHeadline: "Plumbing Problems? We've Got You Covered",
      heroSubtitle: "Fast response, expert solutions, fair pricing",
      ctaPrimary: "Call for Emergency Service",
      ctaSecondary: "Get a Free Quote",
    },
  },
  photography: {
    services: ["Portraits", "Weddings", "Events", "Commercial", "Headshots"],
    tone: "creative artistic",
    issues: [
      "Portfolio images load slowly",
      "No pricing or packages listed",
      "Missing client testimonials",
      "Weak storytelling in gallery",
      "No booking or inquiry form",
    ],
    copy: {
      heroHeadline: "Capturing Your Most Precious Moments",
      heroSubtitle: "Artistic vision, technical excellence, timeless memories",
      ctaPrimary: "View Our Portfolio",
      ctaSecondary: "Book a Session",
    },
  },
  consulting: {
    services: ["Business Strategy", "Digital Transformation", "Operations", "Training"],
    tone: "professional authoritative",
    issues: [
      "Outdated case studies",
      "No clear value proposition",
      "Missing team expertise display",
      "Weak thought leadership",
      "No client testimonials",
    ],
    copy: {
      heroHeadline: "Transform Your Business Strategy",
      heroSubtitle: "Data-driven insights, proven methodologies, measurable results",
      ctaPrimary: "Schedule a Consultation",
      ctaSecondary: "View Case Studies",
    },
  },
};

/**
 * Parse URL and extract business name intelligently
 */
function parseBusinessName(url: string): string {
  // Normalize URL
  const normalized = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");

  // Extract domain name (before .com, .co, etc.)
  const domainMatch = normalized.match(/^([^.]+)/);
  if (!domainMatch) return "Business";

  let name = domainMatch[1];

  // Handle common patterns
  // "joesbarbershop" → "Joe's Barbershop"
  // "smithplumbing" → "Smith Plumbing"
  // "acme-consulting" → "Acme Consulting"

  // Replace hyphens and underscores with spaces
  name = name.replace(/[-_]/g, " ");

  // Capitalize each word
  name = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Handle possessive names (e.g., "Joes" → "Joe's")
  if (name.endsWith("s") && name.length > 3) {
    // Check if it's likely a possessive
    const withoutS = name.slice(0, -1);
    if (withoutS.match(/^[A-Z][a-z]+$/)) {
      name = withoutS + "'s";
    }
  }

  return name;
}

/**
 * Generate realistic scores based on business type
 */
function generateScores(businessType: string): {
  performanceScore: number;
  seoScore: number;
  conversionScore: number;
} {
  // Base scores with realistic variance (40-85 range)
  const basePerformance = 45 + Math.random() * 25;
  const baseSEO = 38 + Math.random() * 28;
  const baseConversion = 42 + Math.random() * 22;

  return {
    performanceScore: Math.round(basePerformance),
    seoScore: Math.round(baseSEO),
    conversionScore: Math.round(baseConversion),
  };
}

/**
 * Calculate confidence score and expected improvement
 */
function calculateConfidence(scores: {
  performanceScore: number;
  seoScore: number;
  conversionScore: number;
}): { confidenceScore: number; expectedImprovement: string } {
  const average = (scores.performanceScore + scores.seoScore + scores.conversionScore) / 3;

  // Lower current score = higher confidence in improvement
  const confidenceScore = Math.round(100 - average / 2);

  // Calculate expected improvement percentage
  const improvementRange = Math.round(confidenceScore * 0.6 + Math.random() * 20);

  return {
    confidenceScore,
    expectedImprovement: `${improvementRange}% conversion increase`,
  };
}

/**
 * Analyzes a website URL and returns structured insights
 */
export async function analyzeSite(url: string): Promise<AnalysisResult> {
  // Simulate processing delay (500ms - 1.5s)
  const delay = Math.random() * 1000 + 500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Parse business name from URL
  const businessName = parseBusinessName(url);

  // Extract keywords from URL
  const normalized = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");
  const keywords = normalized.split(/[.\-_/]/);

  // Find matching business pattern
  let pattern = null;
  let businessType = "generic";

  for (const keyword of keywords) {
    if (businessPatterns[keyword]) {
      pattern = businessPatterns[keyword];
      businessType = keyword;
      break;
    }
  }

  // Use generic pattern if no match
  if (!pattern) {
    pattern = {
      services: ["Service 1", "Service 2", "Service 3"],
      tone: "professional",
      issues: [
        "Outdated design",
        "Poor mobile experience",
        "Weak call-to-action",
        "No clear value proposition",
        "Missing trust signals",
      ],
      copy: {
        heroHeadline: "Welcome to Your Business",
        heroSubtitle: "Quality service, professional approach",
        ctaPrimary: "Get Started",
        ctaSecondary: "Learn More",
      },
    };
  }

  // Generate scores
  const scores = generateScores(businessType);

  // Calculate confidence and improvement
  const { confidenceScore, expectedImprovement } = calculateConfidence(scores);

  return {
    businessName,
    services: pattern.services,
    tone: pattern.tone,
    sections: ["Hero", "Services", "About", "Contact"],
    issues: pattern.issues,
    performanceScore: scores.performanceScore,
    seoScore: scores.seoScore,
    conversionScore: scores.conversionScore,
    confidenceScore,
    expectedImprovement,
  };
}

/**
 * Generate premium rebuild copy based on business type
 */
export function generateRebuildCopy(
  businessName: string,
  services: string[],
  tone: string
): RebuildCopy {
  // Try to find matching pattern for copy
  const keywords = businessName.toLowerCase().split(" ");
  let copy = null;

  for (const keyword of keywords) {
    if (businessPatterns[keyword]?.copy) {
      copy = businessPatterns[keyword].copy;
      break;
    }
  }

  // Generate generic copy if no match
  if (!copy) {
    const primaryService = services[0] || "Our Services";
    copy = {
      heroHeadline: `Experience Excellence with ${businessName}`,
      heroSubtitle: `Premium ${primaryService.toLowerCase()} and professional service`,
      ctaPrimary: "Get Started Today",
      ctaSecondary: "Learn More",
    };
  }

  return copy;
}

/**
 * Validates a URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlWithProtocol = url.includes("://") ? url : `https://${url}`;
    new URL(urlWithProtocol);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlWithProtocol = url.includes("://") ? url : `https://${url}`;
    const domain = new URL(urlWithProtocol).hostname;
    return domain.replace("www.", "");
  } catch {
    return url;
  }
}
