import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { User } from "../../drizzle/schema";

// Mock database with all required functions
vi.mock("../db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../db")>();
  return {
    ...actual,
    createProject: vi.fn().mockResolvedValue({
      id: 1,
      userId: 1,
      title: "Test Project",
      description: "Test Description",
      sourceUrl: "https://example.com",
      projectType: "rebuild",
      status: "created",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    getProjectById: vi.fn().mockResolvedValue({
      id: 1,
      userId: 1,
      title: "Test Project",
      description: "Test Description",
      sourceUrl: "https://example.com",
      projectType: "rebuild",
      status: "created",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    getProjectsByUserId: vi.fn().mockResolvedValue([
      {
        id: 1,
        userId: 1,
        title: "Test Project",
        description: "Test Description",
        sourceUrl: "https://example.com",
        projectType: "rebuild",
        status: "created",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  };
});

describe("Projects Router", () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  });

  it("should create a new project", async () => {
    const caller = appRouter.createCaller({
      user: mockUser,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.projects.create({
      title: "Test Project",
      description: "Test Description",
      sourceUrl: "https://example.com",
      projectType: "rebuild",
    });

    expect(result).toHaveProperty("id");
    expect(result.title).toBe("Test Project");
    expect(result.projectType).toBe("rebuild");
  });

  it("should require authentication for project creation", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    await expect(
      caller.projects.create({
        title: "Test Project",
        description: "Test Description",
        sourceUrl: "https://example.com",
        projectType: "rebuild",
      })
    ).rejects.toThrow();
  });

  it("should retrieve a project", async () => {
    const caller = appRouter.createCaller({
      user: mockUser,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    const result = await caller.projects.get({ projectId: 1 });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });
});
