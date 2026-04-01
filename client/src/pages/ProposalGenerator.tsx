import AppLayout from "@/components/AppLayout";
import GeneratorOutput from "@/components/GeneratorOutput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EXAMPLE_JD = `Looking for a skilled chatbot developer to build a lead capture bot for our real estate agency. We need it to:
- Greet visitors on our website
- Ask qualifying questions (budget, timeline, location)
- Collect name and email
- Schedule a callback with one of our agents

We use WordPress and would like the bot embedded on our homepage. Budget: $200-400. Looking to get started ASAP.`;

export default function ProposalGenerator() {
  const [jobDescription, setJobDescription] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const mutation = trpc.generate.proposal.useMutation({
    onSuccess: (data) => {
      setOutput(data.content);
      toast.success("Proposal generated!");
    },
    onError: (err) => {
      toast.error(err.message || "Generation failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || jobDescription.trim().length < 10) {
      toast.error("Please paste a job description (at least 10 characters).");
      return;
    }
    mutation.mutate({ jobDescription });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Proposal Writer</h1>
            <p className="text-xs text-muted-foreground">Paste a job description from Upwork or Fiverr and get a winning proposal instantly.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-5 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="jobDescription" className="text-sm font-medium text-foreground">Job Description</Label>
              <button
                type="button"
                onClick={() => setJobDescription(EXAMPLE_JD)}
                className="text-xs text-primary hover:underline"
              >
                Load example
              </button>
            </div>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full Upwork or Fiverr job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={10}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none font-mono text-xs leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">{jobDescription.length} / 5000 characters</p>
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Proposal</>
            )}
          </Button>
        </form>

        {/* Output */}
        {mutation.isPending && (
          <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">AI is crafting your proposal...</p>
          </div>
        )}
        {output && !mutation.isPending && (
          <GeneratorOutput content={output} label="Generated Proposal" />
        )}
      </div>
    </AppLayout>
  );
}
