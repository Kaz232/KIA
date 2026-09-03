import React from "react";
import { summarizeDashboardAgents } from "../../../shared/dashboardAgentSummary";

interface AgentItem {
  id?: string;
  name?: string;
  status: string;
}

interface HomeProps {
  agents?: AgentItem[];
}

export const Home: React.FC<HomeProps> = ({ agents = [] }) => {
  const dashboardAgentSummary = summarizeDashboardAgents(agents);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Agentes Especializados</h2>
          <span className="text-xs text-amber-400 font-medium">
            Total: {dashboardAgentSummary.total}
          </span>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
          {`Rascunho: ${dashboardAgentSummary.drafts} · Teste: ${dashboardAgentSummary.tests} · Ativos: ${dashboardAgentSummary.active} · Rejeitados: ${dashboardAgentSummary.rejected} · Inativos: ${dashboardAgentSummary.inactive}`}
        </div>
      </div>
    </div>
  );
};

export default Home;
