import React from "react";
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  FileSearch,
  BookOpen,
  Settings,
  Calendar,
  Users,
  Wand2,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { NavigationTab } from "../types";

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, tasks, scannedDocs } = useApp();

  const pendingTasks = tasks.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS"
  ).length;

  const tabs: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number | string; highlight?: boolean }[] = [
    { id: "dashboard", label: "Painel", icon: LayoutDashboard },
    { id: "kia", label: "KIA", icon: Bot },
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, highlight: true, badge: "24/7" },
    { id: "tasks", label: "Tarefas", icon: CheckSquare, badge: pendingTasks > 0 ? pendingTasks : undefined },
    { id: "studio", label: "Estúdio", icon: Wand2 },
    { id: "settings", label: "Definições", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive
                ? tab.highlight
                  ? "text-amber-400 font-bold"
                  : "text-white font-semibold"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive && tab.highlight ? "text-amber-400" : ""}`} />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
