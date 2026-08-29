import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { DashboardView } from "./components/DashboardView";
import { KiaChatView } from "./components/KiaChatView";
import { KnowledgeBaseView } from "./components/KnowledgeBaseView";
import { ScannerView } from "./components/ScannerView";
import { TasksView } from "./components/TasksView";
import { CalendarView } from "./components/CalendarView";
import { AgentsView } from "./components/AgentsView";
import { SkillsView } from "./components/SkillsView";
import { AgentFactoryView } from "./components/AgentFactoryView";
import { AuditLogView } from "./components/AuditLogView";
import { IncidentManagerView } from "./components/IncidentManagerView";
import { SettingsView } from "./components/SettingsView";
import { WhatsAppIntegrationView } from "./components/WhatsAppIntegrationView";
import { MultimodalStudioView } from "./components/MultimodalStudioView";
import { AuthGateway } from "./components/AuthGateway";
import { SynergyWalkthroughModal } from "./components/SynergyWalkthroughModal";
import { GlobalSynergyModal } from "./components/GlobalSynergyModal";
import { ScenarioSimulatorModal } from "./components/ScenarioSimulatorModal";
import { KazaDispatcherModal } from "./components/KazaDispatcherModal";
import { KiaWakeWordBanner } from "./components/KiaWakeWordBanner";

const MainLayout: React.FC = () => {
  const {
    activeTab,
    isAuthenticated,
    showSynergyTour,
    setShowSynergyTour,
    isSynergyModalOpen,
    setIsSynergyModalOpen,
    isScenarioModalOpen,
    setIsScenarioModalOpen,
    isKazaModalOpen,
    setIsKazaModalOpen,
  } = useApp();

  if (!isAuthenticated) {
    return <AuthGateway />;
  }

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-black font-sans antialiased">
      {/* Top Header */}
      <Header />

      {/* Body: Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className={`flex-1 ${activeTab === "kia" ? "overflow-hidden p-2 sm:p-4" : "overflow-y-auto p-4 lg:p-6"} pb-20 md:pb-6`}>
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "kia" && <KiaChatView />}
          {activeTab === "knowledge" && <KnowledgeBaseView />}
          {activeTab === "scanner" && <ScannerView />}
          {activeTab === "tasks" && <TasksView />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "studio" && <MultimodalStudioView />}
          {activeTab === "agents" && <AgentsView />}
          {activeTab === "skills" && <SkillsView />}
          {activeTab === "agent_factory" && <AgentFactoryView />}
          {activeTab === "incidents" && <IncidentManagerView />}
          {activeTab === "audit" && <AuditLogView />}
          {activeTab === "whatsapp" && <WhatsAppIntegrationView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Onboarding Synergy Walkthrough Modal */}
      <SynergyWalkthroughModal
        isOpen={showSynergyTour}
        onClose={() => setShowSynergyTour(false)}
      />

      {/* Global Synergy Orchestrator Modal */}
      <GlobalSynergyModal
        isOpen={isSynergyModalOpen}
        onClose={() => setIsSynergyModalOpen(false)}
      />

      {/* Scenario & ROAS Simulator Modal */}
      <ScenarioSimulatorModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
      />

      {/* Kaza Core Webhook Dispatcher Modal */}
      <KazaDispatcherModal
        isOpen={isKazaModalOpen}
        onClose={() => setIsKazaModalOpen(false)}
      />

      {/* Persistent Continuous Wake-Word ("KIA") Voice Detector HUD */}
      <KiaWakeWordBanner />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
