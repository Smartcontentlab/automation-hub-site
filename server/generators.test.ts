import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Mock AI generated content for testing." } }],
  }),
}));

vi.mock("./db", () => ({
  createGeneration: vi.fn().mockResolvedValue(undefined),
  getGenerationsByUser: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      type: "cold_email",
      businessName: "Test Dental",
      niche: "Dental Office",
      websiteUrl: "https://testdental.com",
      inputData: "{}",
      outputContent: "Subject: Quick question...\n\nHi there...",
      createdAt: new Date("2026-01-01T10:00:00Z"),
    },
    {
      id: 2,
      userId: 1,
      type: "proposal",
      businessName: null,
      niche: null,
      websiteUrl: null,
      inputData: "Build me a chatbot",
      outputContent: "I can help you build a chatbot...",
      createdAt: new Date("2026-01-02T10:00:00Z"),
    },
  ]),
  deleteGeneration: vi.fn().mockResolvedValue(undefined),
}));

function makeCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("generate.coldEmail", () => {
  it("returns AI-generated content for a valid input", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.coldEmail({
      businessName: "Bright Smile Dental",
      niche: "Dental Office",
      websiteUrl: "https://brightsmile.com",
    });
    expect(result.content).toBe("Mock AI generated content for testing.");
  });

  it("throws validation error for empty businessName", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.coldEmail({ businessName: "", niche: "Dental", websiteUrl: "https://test.com" })
    ).rejects.toThrow();
  });
});

describe("generate.bulkColdEmail", () => {
  it("returns results for each business in the batch", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.bulkColdEmail({
      businesses: [
        { businessName: "Dental A", niche: "Dental Office", websiteUrl: "https://a.com" },
        { businessName: "Realty B", niche: "Real Estate", websiteUrl: "https://b.com" },
      ],
    });
    expect(result.results).toHaveLength(2);
    expect(result.results[0].content).toBe("Mock AI generated content for testing.");
    expect(result.results[1].businessName).toBe("Realty B");
  });

  it("throws validation error for empty businesses array", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.bulkColdEmail({ businesses: [] })
    ).rejects.toThrow();
  });
});

describe("generate.knowledgeBase", () => {
  it("returns AI-generated knowledge base content", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.knowledgeBase({
      businessName: "Bright Smile Dental",
      niche: "Dental Office",
    });
    expect(result.content).toBe("Mock AI generated content for testing.");
  });

  it("throws validation error for empty niche", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.knowledgeBase({ businessName: "Test", niche: "" })
    ).rejects.toThrow();
  });
});

describe("generate.proposal", () => {
  it("returns AI-generated proposal content", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.proposal({
      jobDescription: "Build a chatbot for my real estate website to capture leads.",
    });
    expect(result.content).toBe("Mock AI generated content for testing.");
  });

  it("throws validation error for too-short job description", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.proposal({ jobDescription: "short" })
    ).rejects.toThrow();
  });
});

describe("generate.objectionHandler", () => {
  it("returns AI-generated rebuttal script", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.objectionHandler({
      objection: "We already have a website chat widget, we don't need another one.",
    });
    expect(result.content).toBe("Mock AI generated content for testing.");
  });

  it("throws validation error for too-short objection", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.objectionHandler({ objection: "no" })
    ).rejects.toThrow();
  });
});

describe("generate.followUpEmails", () => {
  it("returns AI-generated follow-up sequence", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.followUpEmails({
      clientName: "Bright Smile Dental",
      context: "Sent a cold email about building an AI chatbot. They opened but did not reply.",
    });
    expect(result.content).toBe("Mock AI generated content for testing.");
  });

  it("throws validation error for too-short context", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.followUpEmails({ clientName: "Test", context: "short" })
    ).rejects.toThrow();
  });
});

describe("generate.onboardingChecklist", () => {
  it("returns AI-generated onboarding checklist", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.generate.onboardingChecklist({
      businessName: "Bright Smile Dental",
      niche: "Dental Office",
    });
    expect(result.content).toBe("Mock AI generated content for testing.");
  });

  it("throws validation error for empty niche", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.generate.onboardingChecklist({ businessName: "Test", niche: "" })
    ).rejects.toThrow();
  });
});

describe("history.list", () => {
  it("returns all generations for the authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.history.list();
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("cold_email");
    expect(result[1].type).toBe("proposal");
  });
});

describe("history.delete", () => {
  it("deletes a generation by id", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.history.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});
