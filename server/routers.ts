import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createGeneration, deleteGeneration, getGenerationsByUser } from "./db";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// --- AI prompts ---

function coldEmailPrompt(businessName: string, niche: string, websiteUrl: string) {
  return `You are an expert B2B copywriter specializing in selling AI automation to local businesses.

Write a short, punchy cold email to "${businessName}", a ${niche} business (website: ${websiteUrl}).
The goal is to pitch a custom AI receptionist chatbot that captures leads 24/7 and answers common questions automatically.
Use the "Missed Revenue" angle — focus on the cost of missing after-hours inquiries.
Mention one specific pain point common to the ${niche} industry.
Keep it under 120 words. Use a conversational tone. Do NOT use jargon like "LLM", "prompt engineering", or "machine learning".
End with a clear, low-pressure call to action (e.g., "Would you be open to a quick 10-minute demo?").

Format: Subject line first, then the email body. No extra commentary.`;
}

function knowledgeBasePrompt(businessName: string, niche: string) {
  return `You are an expert AI Conversation Designer building chatbot systems for local businesses.

Generate a complete chatbot knowledge base document for "${businessName}", a ${niche} business.

Include the following sections in Markdown format:

## 1. AI Persona & Tone
Define the chatbot's name, personality, and communication style for a ${niche} business.

## 2. System Prompt
Write a detailed system prompt (150-200 words) that instructs the AI on its role, what it can and cannot do, and how to handle edge cases.

## 3. Frequently Asked Questions (15 FAQs)
List 15 common questions customers ask a ${niche} business, with placeholder answers in [brackets] where the business owner needs to fill in real data (e.g., [Insert your pricing here], [Insert your hours here]).

## 4. Lead Qualification Flow
Write a 4-step conversational flow the bot uses to qualify a lead before offering to book an appointment or connect with a human. Include the exact questions to ask.

## 5. Escalation Rules
Define 3 scenarios where the bot should say "Let me connect you with our team" and stop trying to answer.`;
}

function proposalPrompt(jobDescription: string) {
  return `You are a top-rated freelancer on Upwork and Fiverr specializing in Voiceflow and ManyChat chatbot development.

Read this job description and write a winning proposal:
---
${jobDescription}
---

Structure your proposal exactly like this:
1. **Hook** (1 sentence): Acknowledge their specific problem directly.
2. **Solution** (2-3 sentences): Explain exactly how you will solve it using Voiceflow or ManyChat. Be specific.
3. **Proof** (1-2 sentences): Mention a relevant result or type of client you have helped (use general examples if needed).
4. **CTA** (1 sentence): Offer a low-pressure next step (quick call, demo, or sample).

Keep the total under 150 words. Be direct, confident, and human. Do NOT use generic phrases like "I am the perfect candidate."`;
}

function objectionHandlerPrompt(objection: string) {
  return `You are a sales coach for a freelance chatbot services agency. A prospect has raised the following objection:

"${objection}"

Write a calm, confident, and empathetic rebuttal script. Structure it as:
1. **Acknowledge** (1 sentence): Validate their concern without agreeing with it.
2. **Reframe** (2-3 sentences): Shift their perspective using a concrete example or analogy.
3. **Evidence** (1-2 sentences): Give a specific result or scenario that counters the objection.
4. **Soft close** (1 sentence): Invite them to take a small, low-risk next step.

Keep the total under 150 words. Sound human, not salesy.`;
}

function followUpEmailPrompt(context: string, clientName: string) {
  return `You are an expert B2B copywriter. Write a 3-email follow-up sequence for a chatbot services freelancer.

Context about the prospect/previous interaction:
"${context}"
Prospect/Business name: ${clientName}

Write exactly 3 emails labeled Email 1, Email 2, and Email 3. Each email should:
- Be under 100 words
- Have a subject line
- Increase urgency slightly with each email
- Email 1: Value reminder (sent 2 days after initial pitch)
- Email 2: Social proof / case study angle (sent 5 days after)
- Email 3: Final "closing the loop" email (sent 10 days after)

Format each email with its subject line clearly labeled. No extra commentary.`;
}

function onboardingChecklistPrompt(businessName: string, niche: string) {
  return `You are an expert chatbot agency project manager. Create a detailed client onboarding checklist for a new chatbot project.

Client: "${businessName}" — a ${niche} business.

Generate a complete onboarding document in Markdown with these sections:

## Client Onboarding Checklist — ${businessName}

### Phase 1: Discovery & Setup (Week 1)
List 6-8 specific action items for gathering information from the client (business hours, FAQs, tone preferences, platform access, etc.)

### Phase 2: Build & Review (Week 2)
List 6-8 specific action items for building the chatbot, getting client approval, and testing.

### Phase 3: Launch & Handoff (Week 3)
List 5-6 specific action items for deploying, training the client, and setting up the monthly retainer.

### Information to Collect from Client
Create a table with: Item | Example | Status (leave blank)
Include 10 key pieces of information needed (business hours, pricing, services, emergency contact, etc.)

### Monthly Maintenance Checklist
List 5 recurring tasks for the monthly retainer service.

Make all items specific to the ${niche} industry.`;
}

// --- Router ---

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  generate: router({
    coldEmail: protectedProcedure
      .input(z.object({
        businessName: z.string().min(1).max(255),
        niche: z.string().min(1).max(255),
        websiteUrl: z.string().min(1).max(512),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert B2B copywriter specializing in AI automation for local businesses." },
            { role: "user", content: coldEmailPrompt(input.businessName, input.niche, input.websiteUrl) },
          ],
        });
        const content = response.choices?.[0]?.message?.content as string | undefined;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content." });
        await createGeneration({
          userId: ctx.user.id,
          type: "cold_email",
          businessName: input.businessName,
          niche: input.niche,
          websiteUrl: input.websiteUrl,
          inputData: JSON.stringify(input),
          outputContent: content,
        });
        return { content };
      }),

    bulkColdEmail: protectedProcedure
      .input(z.object({
        businesses: z.array(z.object({
          businessName: z.string().min(1).max(255),
          niche: z.string().min(1).max(255),
          websiteUrl: z.string().min(1).max(512),
        })).min(1).max(20),
      }))
      .mutation(async ({ ctx, input }) => {
        const results: Array<{ businessName: string; niche: string; websiteUrl: string; content: string; error?: string }> = [];
        for (const biz of input.businesses) {
          try {
            const response = await invokeLLM({
              messages: [
                { role: "system", content: "You are an expert B2B copywriter specializing in AI automation for local businesses." },
                { role: "user", content: coldEmailPrompt(biz.businessName, biz.niche, biz.websiteUrl) },
              ],
            });
            const content = response.choices?.[0]?.message?.content as string | undefined;
            if (!content) throw new Error("No content returned");
            await createGeneration({
              userId: ctx.user.id,
              type: "cold_email",
              businessName: biz.businessName,
              niche: biz.niche,
              websiteUrl: biz.websiteUrl,
              inputData: JSON.stringify(biz),
              outputContent: content,
            });
            results.push({ ...biz, content });
          } catch (err) {
            results.push({ ...biz, content: "", error: "Generation failed for this business." });
          }
        }
        return { results };
      }),

    knowledgeBase: protectedProcedure
      .input(z.object({
        businessName: z.string().min(1).max(255),
        niche: z.string().min(1).max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert AI Conversation Designer building chatbot systems for local businesses." },
            { role: "user", content: knowledgeBasePrompt(input.businessName, input.niche) },
          ],
        });
        const content = response.choices?.[0]?.message?.content as string | undefined;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content." });
        await createGeneration({
          userId: ctx.user.id,
          type: "knowledge_base",
          businessName: input.businessName,
          niche: input.niche,
          inputData: JSON.stringify(input),
          outputContent: content,
        });
        return { content };
      }),

    proposal: protectedProcedure
      .input(z.object({
        jobDescription: z.string().min(10).max(5000),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a top-rated Upwork/Fiverr freelancer specializing in Voiceflow and ManyChat chatbot development." },
            { role: "user", content: proposalPrompt(input.jobDescription) },
          ],
        });
        const content = response.choices?.[0]?.message?.content as string | undefined;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content." });
        await createGeneration({
          userId: ctx.user.id,
          type: "proposal",
          inputData: input.jobDescription,
          outputContent: content,
        });
        return { content };
      }),

    objectionHandler: protectedProcedure
      .input(z.object({
        objection: z.string().min(5).max(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a sales coach for a freelance chatbot services agency." },
            { role: "user", content: objectionHandlerPrompt(input.objection) },
          ],
        });
        const content = response.choices?.[0]?.message?.content as string | undefined;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content." });
        await createGeneration({
          userId: ctx.user.id,
          type: "objection_handler",
          inputData: input.objection,
          outputContent: content,
        });
        return { content };
      }),

    followUpEmails: protectedProcedure
      .input(z.object({
        clientName: z.string().min(1).max(255),
        context: z.string().min(10).max(2000),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert B2B copywriter specializing in follow-up email sequences." },
            { role: "user", content: followUpEmailPrompt(input.context, input.clientName) },
          ],
        });
        const content = response.choices?.[0]?.message?.content as string | undefined;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content." });
        await createGeneration({
          userId: ctx.user.id,
          type: "follow_up",
          businessName: input.clientName,
          inputData: JSON.stringify(input),
          outputContent: content,
        });
        return { content };
      }),

    onboardingChecklist: protectedProcedure
      .input(z.object({
        businessName: z.string().min(1).max(255),
        niche: z.string().min(1).max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert chatbot agency project manager." },
            { role: "user", content: onboardingChecklistPrompt(input.businessName, input.niche) },
          ],
        });
        const content = response.choices?.[0]?.message?.content as string | undefined;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content." });
        await createGeneration({
          userId: ctx.user.id,
          type: "onboarding",
          businessName: input.businessName,
          niche: input.niche,
          inputData: JSON.stringify(input),
          outputContent: content,
        });
        return { content };
      }),
  }),

  history: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getGenerationsByUser(ctx.user.id);
    }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteGeneration(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
