import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { scrapeWebsite } from "../services/scraper";
import { analyzeWebsite, generateSectionImprovements } from "../services/analyzer";
import { generateSiteFromPrompt, rebuildSiteFromSections } from "../services/siteGenerator";
import { scrapeGoogleReviews, analyzeSentiment } from "../services/reviewScraper";
import { nanoid } from "nanoid";

export const projectsRouter = router({
  // Create a new project
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        sourceUrl: z.string().optional(),
        projectType: z.enum(["rebuild", "generate"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.createProject(ctx.user.id, input);
      return project;
    }),

  // Get user's projects
  list: protectedProcedure.query(async ({ ctx }) => {
    const projects = await db.getUserProjects(ctx.user.id);
    return projects;
  }),

  // Get project details
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }
      return project;
    }),

  // Scrape and analyze website
  analyzeWebsite: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sourceUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      // Update project status
      await db.updateProjectStatus(input.projectId, "analyzing");

      try {
        // Scrape website
        const scrapedWebsite = await scrapeWebsite(input.sourceUrl);

        // Create sections in database
        for (let i = 0; i < scrapedWebsite.sections.length; i++) {
          const section = scrapedWebsite.sections[i];
          await db.createSection(input.projectId, {
            sectionType: section.type,
            title: section.title,
            content: section.content,
            order: i,
          });
        }

        // Analyze website
        const analysis = await analyzeWebsite(scrapedWebsite);

        // Store analysis
        const storedAnalysis = await db.createAnalysis(input.projectId, {
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          improvements: analysis.improvements,
          sentiment: analysis.sentiment,
          score: analysis.score,
          aiSummary: analysis.summary,
        });

        // Scrape reviews
        const businessName = scrapedWebsite.title || "Business";
        const reviews = await scrapeGoogleReviews(businessName);

        // Store reviews with sentiment analysis
        for (const review of reviews) {
          await db.createReview(input.projectId, {
            author: review.author,
            rating: review.rating,
            text: review.text,
            sentiment: analyzeSentiment(review.text),
            source: "google",
          });
        }

        // Update project status
        await db.updateProjectStatus(input.projectId, "analyzed");

        return {
          success: true,
          analysis: storedAnalysis,
          sections: scrapedWebsite.sections,
          reviews,
        };
      } catch (error) {
        await db.updateProjectStatus(input.projectId, "failed");
        throw error;
      }
    }),

  // Get project sections
  getSections: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const sections = await db.getSectionsByProjectId(input.projectId);
      return sections;
    }),

  // Update section inclusion
  updateSection: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        sectionId: z.number(),
        included: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const updates: Record<string, any> = {};
      if (input.included !== undefined) updates.included = input.included;
      if (input.order !== undefined) updates.order = input.order;

      await db.updateSection(input.sectionId, updates);
      return { success: true };
    }),

  // Get project analysis
  getAnalysis: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const analysis = await db.getAnalysisByProjectId(input.projectId);
      return analysis;
    }),

  // Get project reviews
  getReviews: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const reviews = await db.getReviewsByProjectId(input.projectId);
      return reviews;
    }),

  // Build/rebuild website
  buildWebsite: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      await db.updateProjectStatus(input.projectId, "building");

      try {
        const sections = await db.getSectionsByProjectId(input.projectId);
        const analysis = await db.getAnalysisByProjectId(input.projectId);

        // Filter included sections
        const includedSections = sections.filter((s) => s.included);

        // Rebuild site
        const generatedSite = await rebuildSiteFromSections(
          includedSections,
          analysis
            ? {
                strengths: (analysis.strengths as any) || [],
                weaknesses: (analysis.weaknesses as any) || [],
                improvements: (analysis.improvements as any) || [],
              }
            : undefined
        );

        // Create preview
        const previewToken = nanoid(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const preview = await db.createPreview(input.projectId, {
          previewToken,
          html: generatedSite.html,
          css: generatedSite.css,
          expiresAt,
        });

        await db.updateProjectStatus(input.projectId, "preview");

        return {
          success: true,
          preview,
          previewToken,
          html: generatedSite.html,
          css: generatedSite.css,
        };
      } catch (error) {
        await db.updateProjectStatus(input.projectId, "failed");
        throw error;
      }
    }),

  // Generate website from prompt
  generateFromPrompt: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        prompt: z.string().min(10),
        industry: z.string().optional(),
        style: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      await db.updateProjectStatus(input.projectId, "building");

      try {
        // Store generation prompt
        await db.createGenerationPrompt(input.projectId, {
          prompt: input.prompt,
          industry: input.industry,
          style: input.style,
        });

        // Generate site
        const generatedSite = await generateSiteFromPrompt(
          input.prompt,
          input.industry,
          input.style
        );

        // Create preview
        const previewToken = nanoid(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const preview = await db.createPreview(input.projectId, {
          previewToken,
          html: generatedSite.html,
          css: generatedSite.css,
          expiresAt,
        });

        await db.updateProjectStatus(input.projectId, "preview");

        return {
          success: true,
          preview,
          previewToken,
          html: generatedSite.html,
          css: generatedSite.css,
        };
      } catch (error) {
        await db.updateProjectStatus(input.projectId, "failed");
        throw error;
      }
    }),

  // Get preview
  getPreview: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const preview = await db.getPreviewByProjectId(input.projectId);
      return preview;
    }),

  // Approve project for launch
  approve: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      await db.updateProjectStatus(input.projectId, "approved");
      return { success: true };
    }),
});
