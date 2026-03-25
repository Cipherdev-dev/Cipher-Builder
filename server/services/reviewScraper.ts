import axios from "axios";

export interface BusinessReview {
  author: string;
  rating: number;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  date?: string;
}

/**
 * Scrape business reviews from Google Places API
 * Note: This requires Google Places API credentials
 * For now, we'll provide a mock implementation that can be extended
 */
export async function scrapeGoogleReviews(businessName: string, location?: string): Promise<BusinessReview[]> {
  try {
    // In a real implementation, you would use the Google Places API
    // For now, returning mock data structure
    // To implement: Use @googlemaps/js-api-loader or direct API calls

    console.log(`Fetching reviews for: ${businessName} ${location ? `in ${location}` : ""}`);

    // Mock reviews - replace with actual API calls
    const mockReviews: BusinessReview[] = [
      {
        author: "John Doe",
        rating: 5,
        text: "Excellent service and great quality. Highly recommend!",
        sentiment: "positive",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        author: "Jane Smith",
        rating: 4,
        text: "Good experience overall. Could improve response time.",
        sentiment: "positive",
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        author: "Bob Johnson",
        rating: 3,
        text: "Average service. Nothing special.",
        sentiment: "neutral",
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return mockReviews;
  } catch (error) {
    console.error("Error scraping reviews:", error);
    throw new Error(`Failed to scrape reviews: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Analyze sentiment of review text
 */
export function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const positiveWords = [
    "excellent",
    "great",
    "amazing",
    "wonderful",
    "fantastic",
    "awesome",
    "good",
    "love",
    "perfect",
    "best",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "poor",
    "hate",
    "worst",
    "disappointing",
    "useless",
    "waste",
  ];

  const lowerText = text.toLowerCase();

  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Get average rating from reviews
 */
export function getAverageRating(reviews: BusinessReview[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Get sentiment distribution from reviews
 */
export function getSentimentDistribution(reviews: BusinessReview[]): {
  positive: number;
  neutral: number;
  negative: number;
} {
  return {
    positive: reviews.filter((r) => r.sentiment === "positive").length,
    neutral: reviews.filter((r) => r.sentiment === "neutral").length,
    negative: reviews.filter((r) => r.sentiment === "negative").length,
  };
}
