import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Rebuild from "./pages/Rebuild";
import Generate from "./pages/Generate";
import Discover from "./pages/Discover";
import ProjectAnalysis from "./pages/ProjectAnalysis";
import Preview from "./pages/Preview";
import ProjectPreview from "./pages/ProjectPreview";
import ProjectLaunch from "./pages/ProjectLaunch";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/discover"} component={Discover} />
      <Route path={"/rebuild"} component={Rebuild} />
      <Route path={"/generate"} component={Generate} />
      <Route path={"/project/:projectId"} component={ProjectAnalysis} />
      <Route path={"/project/:projectId/preview"} component={ProjectPreview} />
      <Route path={"/project/:projectId/launch"} component={ProjectLaunch} />
      <Route path={"/preview/:token"} component={Preview} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
