import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { nanoid } from "nanoid";

export const deploymentRouter = router({
  // Get preview by token (public access for email links)
  getPublicPreview: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const preview = await db.getPreviewByToken(input.token);
      if (!preview) {
        throw new Error("Preview not found or expired");
      }

      // Check expiration
      if (preview.expiresAt && new Date() > preview.expiresAt) {
        throw new Error("Preview link has expired");
      }

      // Increment access count
      await db.updatePreviewAccessCount(preview.id);

      return {
        html: preview.html,
        css: preview.css,
        projectId: preview.projectId,
      };
    }),

  // Send preview email
  sendPreviewEmail: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        recipientEmail: z.string().email(),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const preview = await db.getPreviewByProjectId(input.projectId);
      if (!preview) {
        throw new Error("No preview available");
      }

      // Create email notification
      const emailNotification = await db.createEmailNotification(input.projectId, {
        recipientEmail: input.recipientEmail,
        previewToken: preview.previewToken,
        subject: input.subject || `Preview: ${project.title}`,
      });

      // In a real implementation, send email here
      // For now, just mark as sent
      await db.updateEmailNotification(emailNotification.id, {
        status: "sent",
        sentAt: new Date(),
      });

      return {
        success: true,
        emailId: emailNotification.id,
        previewUrl: `/preview/${preview.previewToken}`,
      };
    }),

  // Create customer domain
  createDomain: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        customDomain: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      // Generate temporary domain
      const tempDomain = `${nanoid(12)}.preview.site`;

      const domain = await db.createCustomerDomain(input.projectId, {
        domain: tempDomain,
        customDomain: input.customDomain,
      });

      return domain;
    }),

  // Get customer domain
  getDomain: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const domain = await db.getCustomerDomainByProjectId(input.projectId);
      return domain;
    }),

  // Verify custom domain ownership
  verifyDomain: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        customDomain: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const domain = await db.getCustomerDomainByProjectId(input.projectId);
      if (!domain) {
        throw new Error("Domain not found");
      }

      // In a real implementation, verify DNS records here
      // For now, just update status
      await db.updateCustomerDomain(domain.id, {
        status: "verified",
      });

      return {
        success: true,
        domain: input.customDomain,
      };
    }),

  // Launch website to domain
  launchWebsite: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        customDomain: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      if (project.status !== "approved") {
        throw new Error("Project must be approved before launching");
      }

      const preview = await db.getPreviewByProjectId(input.projectId);
      if (!preview) {
        throw new Error("No preview available");
      }

      let domain = await db.getCustomerDomainByProjectId(input.projectId);
      if (!domain) {
        domain = await db.createCustomerDomain(input.projectId, {
          domain: `${nanoid(12)}.site`,
          customDomain: input.customDomain,
        });
      }

      // In a real implementation, deploy to actual hosting here
      // For now, just update status
      await db.updateCustomerDomain(domain.id, {
        status: "active",
        deploymentUrl: `https://${domain.domain}`,
        deployedAt: new Date(),
      } as any);

      await db.updateProjectStatus(input.projectId, "launched");

      return {
        success: true,
        deploymentUrl: `https://${domain.domain}`,
        customDomain: domain.customDomain,
      };
    }),

  // Get deployment status
  getDeploymentStatus: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      if (!project || project.userId !== ctx.user.id) {
        throw new Error("Project not found");
      }

      const domain = await db.getCustomerDomainByProjectId(input.projectId);
      const emails = await db.getEmailNotificationsByProjectId(input.projectId);

      return {
        projectStatus: project.status,
        domain,
        emails,
      };
    }),
});
