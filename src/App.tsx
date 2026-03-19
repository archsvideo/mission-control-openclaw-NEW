import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import OverviewPage from "@/pages/OverviewPage";
import AgentsPage from "@/pages/AgentsPage";
import TasksPage from "@/pages/TasksPage";
import TradingPage from "@/pages/TradingPage";
import MarketingPage from "@/pages/MarketingPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import TimelinePage from "@/pages/TimelinePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/marketing" element={<MarketingPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
