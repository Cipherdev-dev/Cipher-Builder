import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  decimal,
  longtext,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - represents a website rebuilding project
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sourceUrl: varchar("sourceUrl", { length: 2048 }), // Original domain to analyze
  status: mysqlEnum("status", [
    "input",
    "analyzing",
    "analyzed",
    "building",
    "preview",
    "approved",
    "launching",
    "launched",
    "failed",
  ])
    .default("input")
    .notNull(),
  projectType: mysqlEnum("projectType", ["rebuild", "generate"]).default("rebuild").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Analysis results - stores AI analysis of source website
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  strengths: json("strengths").$type<string[]>(), // Array of identified strengths
  weaknesses: json("weaknesses").$type<string[]>(), // Array of identified weaknesses
  improvements: json("improvements").$type<string[]>(), // Suggested improvements
  sentiment: varchar("sentiment", { length: 50 }), // Overall sentiment (positive, neutral, negative)
  score: decimal("score", { precision: 3, scale: 2 }), // Overall quality score (0-10)
  aiSummary: longtext("aiSummary"), // AI-generated analysis summary
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Website sections - extracted from source or generated
 */
export const sections = mysqlTable("sections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  sectionType: mysqlEnum("sectionType", [
    "header",
    "hero",
    "features",
    "testimonials",
    "footer",
    "custom",
  ]).notNull(),
  title: varchar("title", { length: 255 }),
  content: longtext("content"), // HTML/text content
  order: int("order").default(0), // Display order
  included: boolean("included").default(true), // Whether to include in rebuilt site
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

/**
 * Business reviews - scraped from Google Places API
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  author: varchar("author", { length: 255 }),
  rating: int("rating"), // 1-5 stars
  text: longtext("text"),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]),
  source: varchar("source", { length: 50 }).default("google"), // google, yelp, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Preview URLs - temporary URLs for site preview
 */
export const previews = mysqlTable("previews", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  previewToken: varchar("previewToken", { length: 255 }).notNull().unique(),
  html: longtext("html"), // Generated HTML for preview
  css: longtext("css"), // Generated CSS for preview
  expiresAt: timestamp("expiresAt"), // When preview link expires
  accessCount: int("accessCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Preview = typeof previews.$inferSelect;
export type InsertPreview = typeof previews.$inferInsert;

/**
 * Customer domains - tracks where sites are deployed
 */
export const customerDomains = mysqlTable("customerDomains", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  customDomain: varchar("customDomain", { length: 255 }), // Customer's own domain
  status: mysqlEnum("status", ["pending", "verified", "active", "failed"])
    .default("pending")
    .notNull(),
  deploymentUrl: varchar("deploymentUrl", { length: 2048 }), // Where site is deployed
  dnsRecords: json("dnsRecords").$type<Record<string, string>>(), // DNS config for verification
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deployedAt: timestamp("deployedAt"),
});

export type CustomerDomain = typeof customerDomains.$inferSelect;
export type InsertCustomerDomain = typeof customerDomains.$inferInsert;

/**
 * Email notifications - tracks sent emails with preview links
 */
export const emailNotifications = mysqlTable("emailNotifications", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  previewToken: varchar("previewToken", { length: 255 }),
  subject: varchar("subject", { length: 255 }),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"])
    .default("pending")
    .notNull(),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
});

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

/**
 * Generation prompts - for AI-based site generation from scratch
 */
export const generationPrompts = mysqlTable("generationPrompts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  prompt: longtext("prompt").notNull(), // User's site generation prompt
  industry: varchar("industry", { length: 100 }), // Business industry/category
  style: varchar("style", { length: 100 }), // Design style preference
  features: json("features").$type<string[]>(), // Requested features
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GenerationPrompt = typeof generationPrompts.$inferSelect;
export type InsertGenerationPrompt = typeof generationPrompts.$inferInsert;
