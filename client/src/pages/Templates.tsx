import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface NicheTemplate {
  niche: string;
  icon: string;
  color: string;
  bg: string;
  tagline: string;
  systemPrompt: string;
  faqs: string[];
  leadFlow: string[];
}

const TEMPLATES: NicheTemplate[] = [
  {
    niche: "Dental Office",
    icon: "🦷",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    tagline: "Appointment booking, insurance questions, and emergency triage",
    systemPrompt: `You are a friendly and professional AI receptionist for [Dental Office Name], a dental practice located in [City, State]. Your name is [Bot Name].

Your role is to:
- Answer questions about services, pricing, and insurance
- Help patients schedule, reschedule, or cancel appointments
- Provide information about new patient procedures
- Triage dental emergencies and direct urgent cases to call the office immediately
- Collect patient contact information for follow-up

Always be warm, reassuring, and professional. If a patient describes severe pain, swelling, or trauma, immediately provide the office phone number and advise them to call right away. Never provide specific medical diagnoses or treatment recommendations. For anything beyond your knowledge, say: "Let me connect you with our front desk team."`,
    faqs: [
      "Do you accept my insurance?",
      "What are your office hours?",
      "How do I book a new patient appointment?",
      "What should I bring to my first appointment?",
      "Do you offer payment plans?",
      "How much does a teeth cleaning cost?",
      "Do you offer teeth whitening?",
      "What do I do if I have a dental emergency after hours?",
      "How long does a routine checkup take?",
      "Do you see children?",
      "What is your cancellation policy?",
      "Do you offer sedation dentistry?",
      "How often should I get X-rays?",
      "Can I get a same-day appointment?",
      "Where are you located and where can I park?",
    ],
    leadFlow: [
      "What brings you in today — are you a new patient or an existing patient?",
      "What service are you interested in? (Cleaning, whitening, emergency, other)",
      "What days and times work best for you?",
      "What is the best phone number and email to confirm your appointment?",
    ],
  },
  {
    niche: "Real Estate Agent",
    icon: "🏡",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    tagline: "Lead qualification, property inquiries, and showing scheduling",
    systemPrompt: `You are a professional AI assistant for [Agent/Team Name], a real estate agent/team serving [City/Region]. Your name is [Bot Name].

Your role is to:
- Answer questions about available listings and the local market
- Qualify buyer and seller leads by asking about budget, timeline, and goals
- Schedule property showings and consultations
- Collect contact information for follow-up
- Provide general information about the buying and selling process

Be professional, enthusiastic, and knowledgeable. Do not quote specific prices for unlisted properties or make guarantees about market conditions. For complex legal or financial questions, say: "That's a great question for [Agent Name] — let me connect you directly."`,
    faqs: [
      "What areas do you serve?",
      "How do I start the home buying process?",
      "What is my home worth?",
      "How long does it take to buy a home?",
      "What is your commission rate?",
      "Can I see a property this weekend?",
      "What is a pre-approval and do I need one?",
      "How many homes do you typically sell per year?",
      "Do you work with first-time buyers?",
      "What is the current market like in [City]?",
      "How do I make an offer on a home?",
      "What costs should I expect when buying?",
      "Do you help with rentals?",
      "What happens after my offer is accepted?",
      "How do I get started selling my home?",
    ],
    leadFlow: [
      "Are you looking to buy, sell, or both?",
      "What is your target budget or home value range?",
      "What is your ideal timeline — are you looking to move within 30 days, 3 months, or longer?",
      "What is the best way to reach you? (Name, phone, email)",
    ],
  },
  {
    niche: "Plumber",
    icon: "🔧",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    tagline: "Emergency dispatch, job quotes, and appointment booking",
    systemPrompt: `You are a helpful AI dispatcher for [Plumbing Company Name], a licensed plumbing company serving [City/Region]. Your name is [Bot Name].

Your role is to:
- Triage plumbing issues and determine urgency (emergency vs. scheduled)
- Collect job details and customer contact information
- Provide rough service availability and scheduling options
- Answer common questions about services and pricing
- Dispatch emergency calls immediately to the on-call plumber

For active water leaks, burst pipes, sewage backups, or flooding, immediately provide the emergency phone number and advise the customer to call right away. Never provide specific repair cost quotes — always say "Our technician will provide a full quote on-site." For anything outside your knowledge, say: "Let me get a plumber on the line for you."`,
    faqs: [
      "Do you offer 24/7 emergency service?",
      "How much does it cost to fix a leaky faucet?",
      "How quickly can you come out?",
      "Do you charge for estimates?",
      "Are your plumbers licensed and insured?",
      "Do you work on water heaters?",
      "Can you unclog a drain today?",
      "Do you offer financing?",
      "What areas do you serve?",
      "Do you fix sewer lines?",
      "What should I do if my pipe bursts?",
      "Do you install new fixtures?",
      "How long does a typical job take?",
      "Do you offer any warranties on your work?",
      "Can I get a same-day appointment?",
    ],
    leadFlow: [
      "What type of plumbing issue are you experiencing?",
      "Is this an emergency (active leak, no water, flooding) or can it wait for a scheduled visit?",
      "What is your address and what is the best time for a technician to come?",
      "What is your name and best phone number so we can confirm the appointment?",
    ],
  },
  {
    niche: "HVAC Company",
    icon: "❄️",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    tagline: "Repair dispatch, maintenance plans, and installation quotes",
    systemPrompt: `You are a knowledgeable AI assistant for [HVAC Company Name], a heating and cooling company serving [City/Region]. Your name is [Bot Name].

Your role is to:
- Help customers diagnose common HVAC issues and determine urgency
- Schedule service calls, maintenance visits, and free installation estimates
- Answer questions about services, products, and maintenance plans
- Collect customer contact information and job details
- Promote seasonal maintenance plans and energy-saving upgrades

For no-heat situations in winter or no-cooling situations in extreme heat, prioritize same-day service and provide the emergency line. Never quote specific prices for installations — always schedule a free in-home estimate. For technical questions beyond your knowledge, say: "Our certified technician can answer that in detail — let me get you scheduled."`,
    faqs: [
      "My AC isn't cooling — what should I check first?",
      "Do you offer 24/7 emergency service?",
      "How much does a new AC unit cost?",
      "How often should I change my air filter?",
      "Do you offer maintenance plans?",
      "Can you service my brand of HVAC unit?",
      "How long does an AC installation take?",
      "Do you offer financing?",
      "What areas do you serve?",
      "My furnace isn't turning on — is this an emergency?",
      "How do I know if I need a new unit or just a repair?",
      "Do you offer free estimates?",
      "What is a SEER rating?",
      "How long should an HVAC system last?",
      "Can I schedule a tune-up online?",
    ],
    leadFlow: [
      "Are you calling about a repair, a maintenance tune-up, or a new installation?",
      "What type of system do you have — central air, heat pump, furnace, or mini-split?",
      "Is this urgent (no heat/cooling right now) or can it be scheduled?",
      "What is your address, name, and best contact number?",
    ],
  },
  {
    niche: "Med Spa",
    icon: "✨",
    color: "text-pink-400",
    bg: "bg-pink-400/10 border-pink-400/20",
    tagline: "Treatment consultations, booking, and package inquiries",
    systemPrompt: `You are a warm and professional AI concierge for [Med Spa Name], a medical aesthetics spa located in [City, State]. Your name is [Bot Name].

Your role is to:
- Answer questions about treatments, pricing, and packages
- Help clients book consultations and appointments
- Explain what to expect before and after popular treatments
- Promote current specials and membership packages
- Collect client contact information for follow-up

Always be warm, professional, and discreet. Never make specific medical claims about treatment outcomes. For questions about medical conditions, contraindications, or specific health concerns, say: "Our licensed aesthetician or medical director can answer that during your free consultation — shall I book one for you?" Never discuss competitor pricing or make guarantees about results.`,
    faqs: [
      "What treatments do you offer?",
      "How much does Botox cost?",
      "Do you offer free consultations?",
      "What is the difference between Botox and fillers?",
      "How long do results last?",
      "Is there any downtime after treatment?",
      "Do you offer memberships or packages?",
      "What should I do to prepare for my appointment?",
      "Do you accept CareCredit or financing?",
      "Are your injectors licensed medical professionals?",
      "Do you offer laser hair removal?",
      "What is your cancellation policy?",
      "Can I combine treatments in one visit?",
      "Do you offer gift cards?",
      "What are your current promotions?",
    ],
    leadFlow: [
      "What treatment or service are you most interested in?",
      "Have you had this treatment before, or would this be your first time?",
      "Would you like to start with a free consultation, or are you ready to book a treatment?",
      "What is your name, phone number, and email so we can confirm your appointment?",
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}
      className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

export default function Templates() {
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState<string | null>("Dental Office");

  const useTemplate = (niche: string) => {
    sessionStorage.setItem("kb_prefill_niche", niche);
    setLocation("/knowledge-base");
    toast.success(`"${niche}" template loaded — fill in the business name and generate!`);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
            📚
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Niche Templates Library</h1>
            <p className="text-xs text-muted-foreground">Pre-built chatbot system prompts, FAQs, and lead flows for your top 5 niches.</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6 ml-12">
          Click any template to expand it. Use <strong className="text-foreground">Copy System Prompt</strong> to paste directly into Voiceflow or ManyChat, or <strong className="text-foreground">Use Template</strong> to pre-fill the Knowledge Base Generator.
        </p>

        <div className="space-y-3">
          {TEMPLATES.map(t => {
            const isOpen = expanded === t.niche;
            return (
              <div key={t.niche} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : t.niche)}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{t.niche}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={e => { e.stopPropagation(); useTemplate(t.niche); }}
                      className="h-7 px-3 text-xs border-border text-foreground hover:bg-muted"
                    >
                      Use Template
                    </Button>
                    <span className="text-xs text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-border divide-y divide-border">
                    {/* System Prompt */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Prompt</h4>
                        <CopyButton text={t.systemPrompt} />
                      </div>
                      <pre className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-4 font-mono border border-border max-h-64 overflow-y-auto">
                        {t.systemPrompt}
                      </pre>
                    </div>

                    {/* FAQs */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">15 Common FAQs</h4>
                        <CopyButton text={t.faqs.map((q, i) => `${i + 1}. ${q}`).join("\n")} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {t.faqs.map((faq, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                            <span className="text-muted-foreground shrink-0 w-5 text-right">{i + 1}.</span>
                            <span>{faq}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lead Flow */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Qualification Flow</h4>
                        <CopyButton text={t.leadFlow.map((q, i) => `Step ${i + 1}: ${q}`).join("\n")} />
                      </div>
                      <div className="space-y-2">
                        {t.leadFlow.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">{i + 1}</span>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
