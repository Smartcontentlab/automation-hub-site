import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import ColdEmail from "./pages/ColdEmail";
import KnowledgeBase from "./pages/KnowledgeBase";
import ProposalGenerator from "./pages/ProposalGenerator";
import History from "./pages/History";
import Templates from "./pages/Templates";
import ObjectionHandler from "./pages/ObjectionHandler";
import FollowUp from "./pages/FollowUp";
import Onboarding from "./pages/Onboarding";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/cold-email" component={ColdEmail} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/proposal" component={ProposalGenerator} />
      <Route path="/history" component={History} />
      <Route path="/templates" component={Templates} />
      <Route path="/objection-handler" component={ObjectionHandler} />
      <Route path="/follow-up" component={FollowUp} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
