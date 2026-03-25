import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  projects,
  analyses,
  sections,
  reviews,
  previews,
  customerDomains,
  emailNotifications,
  generationPrompts,
  type Project,
  type Analysis,
  type Section,
  type Review,
  type Preview,
  type CustomerDomain,
  type EmailNotification,
  type GenerationPrompt,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== PROJECT QUERIES =====

export async function createProject(
  userId: number,
  data: {
    title: string;
    description?: string;
    sourceUrl?: string;
    projectType: "rebuild" | "generate";
  }
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values({
    userId,
    title: data.title,
    description: data.description,
    sourceUrl: data.sourceUrl,
    projectType: data.projectType,
  });

  const projectId = result[0].insertId;
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId as number))
    .limit(1);

  return project[0]!;
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return result[0];
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function updateProjectStatus(
  id: number,
  status: Project["status"]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(projects).set({ status }).where(eq(projects.id, id));
}

// ===== ANALYSIS QUERIES =====

export async function createAnalysis(
  projectId: number,
  data: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    sentiment: string;
    score: number;
    aiSummary: string;
  }
): Promise<Analysis> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(analyses).values({
    projectId,
    strengths: data.strengths as any,
    weaknesses: data.weaknesses as any,
    improvements: data.improvements as any,
    sentiment: data.sentiment,
    score: data.score as any,
    aiSummary: data.aiSummary,
  });

  const analysisId = result[0].insertId;
  const analysis = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, analysisId as number))
    .limit(1);

  return analysis[0]!;
}

export async function getAnalysisByProjectId(
  projectId: number
): Promise<Analysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(analyses)
    .where(eq(analyses.projectId, projectId))
    .limit(1);

  return result[0];
}

// ===== SECTION QUERIES =====

export async function createSection(
  projectId: number,
  data: {
    sectionType: Section["sectionType"];
    title?: string;
    content?: string;
    order?: number;
  }
): Promise<Section> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(sections).values({
    projectId,
    sectionType: data.sectionType,
    title: data.title,
    content: data.content,
    order: data.order ?? 0,
  });

  const sectionId = result[0].insertId;
  const section = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionId as number))
    .limit(1);

  return section[0]!;
}

export async function getSectionsByProjectId(projectId: number): Promise<Section[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(sections)
    .where(eq(sections.projectId, projectId));
}

export async function updateSection(
  id: number,
  data: Partial<{
    title: string;
    content: string;
    order: number;
    included: boolean;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(sections).set(data).where(eq(sections.id, id));
}

// ===== REVIEW QUERIES =====

export async function createReview(
  projectId: number,
  data: {
    author?: string;
    rating?: number;
    text?: string;
    sentiment?: "positive" | "neutral" | "negative";
    source?: string;
  }
): Promise<Review> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values({
    projectId,
    author: data.author,
    rating: data.rating,
    text: data.text,
    sentiment: data.sentiment,
    source: data.source,
  });

  const reviewId = result[0].insertId;
  const review = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId as number))
    .limit(1);

  return review[0]!;
}

export async function getReviewsByProjectId(projectId: number): Promise<Review[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reviews).where(eq(reviews.projectId, projectId));
}

// ===== PREVIEW QUERIES =====

export async function createPreview(
  projectId: number,
  data: {
    previewToken: string;
    html?: string;
    css?: string;
    expiresAt?: Date;
  }
): Promise<Preview> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(previews).values({
    projectId,
    previewToken: data.previewToken,
    html: data.html,
    css: data.css,
    expiresAt: data.expiresAt,
  });

  const previewId = result[0].insertId;
  const preview = await db
    .select()
    .from(previews)
    .where(eq(previews.id, previewId as number))
    .limit(1);

  return preview[0]!;
}

export async function getPreviewByToken(token: string): Promise<Preview | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(previews)
    .where(eq(previews.previewToken, token))
    .limit(1);

  return result[0];
}

export async function getPreviewByProjectId(projectId: number): Promise<Preview | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(previews)
    .where(eq(previews.projectId, projectId))
    .limit(1);

  return result[0];
}

export async function updatePreviewAccessCount(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const preview = await db
    .select()
    .from(previews)
    .where(eq(previews.id, id))
    .limit(1);

  if (preview[0]) {
    await db
      .update(previews)
      .set({ accessCount: (preview[0].accessCount ?? 0) + 1 })
      .where(eq(previews.id, id));
  }
}

// ===== CUSTOMER DOMAIN QUERIES =====

export async function createCustomerDomain(
  projectId: number,
  data: {
    domain: string;
    customDomain?: string;
  }
): Promise<CustomerDomain> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customerDomains).values({
    projectId,
    domain: data.domain,
    customDomain: data.customDomain,
  });

  const domainId = result[0].insertId;
  const domain = await db
    .select()
    .from(customerDomains)
    .where(eq(customerDomains.id, domainId as number))
    .limit(1);

  return domain[0]!;
}

export async function getCustomerDomainByProjectId(
  projectId: number
): Promise<CustomerDomain | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(customerDomains)
    .where(eq(customerDomains.projectId, projectId))
    .limit(1);

  return result[0];
}

export async function updateCustomerDomain(
  id: number,
  data: Partial<{
    status: CustomerDomain["status"];
    deploymentUrl: string;
    dnsRecords: Record<string, string>;
    deployedAt: Date;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(customerDomains).set(data).where(eq(customerDomains.id, id));
}

// ===== EMAIL NOTIFICATION QUERIES =====

export async function createEmailNotification(
  projectId: number,
  data: {
    recipientEmail: string;
    previewToken?: string;
    subject?: string;
  }
): Promise<EmailNotification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailNotifications).values({
    projectId,
    recipientEmail: data.recipientEmail,
    previewToken: data.previewToken,
    subject: data.subject,
  });

  const notificationId = result[0].insertId;
  const notification = await db
    .select()
    .from(emailNotifications)
    .where(eq(emailNotifications.id, notificationId as number))
    .limit(1);

  return notification[0]!;
}

export async function getEmailNotificationsByProjectId(
  projectId: number
): Promise<EmailNotification[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(emailNotifications)
    .where(eq(emailNotifications.projectId, projectId));
}

export async function updateEmailNotification(
  id: number,
  data: Partial<{
    status: EmailNotification["status"];
    sentAt: Date;
    openedAt: Date;
    clickedAt: Date;
  }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(emailNotifications).set(data).where(eq(emailNotifications.id, id));
}

// ===== GENERATION PROMPT QUERIES =====

export async function createGenerationPrompt(
  projectId: number,
  data: {
    prompt: string;
    industry?: string;
    style?: string;
    features?: string[];
  }
): Promise<GenerationPrompt> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(generationPrompts).values({
    prompt: data.prompt,
    industry: data.industry,
    style: data.style,
    features: data.features as any,
  } as any);

  const promptId = result[0].insertId;
  const generatedPrompt = await db
    .select()
    .from(generationPrompts)
    .where(eq(generationPrompts.id, promptId as number))
    .limit(1);

  return generatedPrompt[0]!;
}

export async function getGenerationPromptByProjectId(
  projectId: number
): Promise<GenerationPrompt | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(generationPrompts)
    .where(eq(generationPrompts.projectId, projectId))
    .limit(1);

  return result[0];
}
