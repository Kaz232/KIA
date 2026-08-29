import React from "react";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  FileSearch,
  CheckSquare,
  Calendar,
  Users,
  Wrench,
  Cpu,
  Shield,
  ShieldAlert,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Wand2,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { NavigationTab } from "../types";

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, scannedDocs, auditLogs, currentUser, activeRole } =
    useApp();

  const pendingTasksCount = tasks.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS"
  ).length;
  const pendingDocsCount = scannedDocs.filter(
    (d) => d.status === "REVIEW_REQUIRED" || d.status === "UPLOADED"
  ).length;

  const mainNavItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Painel Principal",
      icon: LayoutDashboard,
    },
    {
      id: "kia",
      label: "KIA Master Agent",
      icon: Bot,
      highlight: true,
      badge: "LIVE",
    },
    {
      id: "whatsapp",
      label: "WhatsApp Business API",
      icon: MessageSquare,
      highlight: true,
      badge: "24/7",
    },
    {
      id: "tasks",
      label: "Tarefas & Fluxos",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: "scanner",
      label: "Scanner Documental",
      icon: FileSearch,
      badge: pendingDocsCount > 0 ? pendingDocsCount : undefined,
    },
    {
      id: "knowledge",
      label: "Base de Conhecimento",
      icon: BookOpen,
    },
    {
      id: "calendar",
      label: "Agenda & Prazos",
      icon: Calendar,
    },
    {
      id: "studio",
      label: "Estúdio Multimodal & Veo",
      icon: Wand2,
      highlight: true,
      badge: "VEO/LIVE",
    },
  ];

  const operationalNavItems: NavItem[] = [
    {
      id: "agents",
      label: "Equipa de Agentes",
      icon: Users,
    },
    {
      id: "skills",
      label: "Skills & Ferramentas",
      icon: Wrench,
    },
    {
      id: "agent_factory",
      label: "Fábrica de Agentes",
      icon: Cpu,
    },
    {
      id: "incidents",
      label: "Autocura & Resolução",
      icon: ShieldAlert,
      badge: "AUTO",
      highlight: true,
    },
    {
      id: "audit",
      label: "Trilha de Auditoria",
      icon: Shield,
      badge: auditLogs.length > 0 ? auditLogs.length : undefined,
    },
    {
      id: "settings",
      label: "Definições do Sistema",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#07090e] border-r border-slate-800/80 shrink-0 select-none z-20">
      {/* Brand Mini Banner */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-900/90 to-amber-950/30 p-3 rounded-2xl border border-amber-500/20 shadow-inner">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-black text-lg shadow-md shadow-amber-500/20 shrink-0">
            G
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm text-white tracking-wide truncate">
                GAG Visual
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                OS
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span>KIA Kernel Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {/* Core Operations Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Operações Centrais</span>
            <Sparkles className="w-3 h-3 text-amber-400/70" />
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? item.highlight
                        ? "bg-gradient-to-r from-amber-500/25 to-yellow-500/10 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "bg-slate-800/90 text-white border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? item.highlight
                            ? "text-amber-400"
                            : "text-white"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          item.highlight
                            ? "bg-amber-400 text-black shadow-sm"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System & Architecture Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Arquitetura & Segurança</span>
            <ShieldCheck className="w-3 h-3 text-slate-500" />
          </div>

          <nav className="space-y-1">
            {operationalNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-slate-800/90 text-white border border-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-amber-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / User Profile & Role Status */}
      <div className="p-3 border-t border-slate-800/80 bg-[#06080d]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="font-semibold text-slate-200 truncate leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
                {activeRole}
              </div>
            </div>
          </div>

          <div
            className="p-1 rounded-md text-slate-400 hover:text-white"
            title="Sessão Ativa & Criptografia SHA-256"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};
