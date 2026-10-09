import { Agent } from "../types";

export const AGENTS_LIST = [
  { id: 'kia-master', name: 'KIA Master', role: 'Orquestrador Geral e Cérebro IA', status: 'ACTIVE' },
  { id: 'consultor-gag', name: 'Consultor GAG', role: 'Consultoria Estratégica de Mercado', status: 'ACTIVE' },
  { id: 'scanner-doc', name: 'Scanner Documental', role: 'Processamento OCR de Comprovativos e Faturas', status: 'ACTIVE' },
  { id: 'soba-arch', name: 'O Soba', role: 'Arquiteto-Chefe de IA e GAG Core', status: 'ACTIVE' },
  { id: 'prof-mestre', name: 'Professor & Mestre', role: 'Gestão de Conhecimento e Formação', status: 'ACTIVE' },
  { id: 'dir-art-motion', name: 'Diretor de Arte & Motion', role: 'Direção Criativa e Vídeo Veo', status: 'ACTIVE' },
  { id: 'copywriter', name: 'Copywriter & Estrategista', role: 'Criação de Conteúdo e Campanhas', status: 'ACTIVE' },
  { id: 'kaza-arch', name: 'Arquiteto Kaza Core', role: 'Automação de Webhooks e Workflows', status: 'ACTIVE' },
  { id: 'rede-infra', name: 'Analista de Infraestrutura', role: 'Redes e Topologia de Servidores', status: 'ACTIVE' },
  { id: 'avatar-gen', name: 'Diretor de Avatares', role: 'IA Generativa Visual e Cultural', status: 'ACTIVE' },
  { id: 'brand-kits', name: 'Estrategista Brand Kits', role: 'Identidade Visual e Guias de Estilo', status: 'ACTIVE' },
  { id: 'gestor-trafego', name: 'Gestor de Trafego ROAS', role: 'Gestão de Anúncios e Conversão', status: 'ACTIVE' },
  { id: 'comercial-agt', name: 'Agente Comercial & AGT', role: 'Vendas WhatsApp e Emissão de Faturas AGT', status: 'ACTIVE' }
];

export function escapeCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function generateAgentsCsv(
  agents: Agent[],
  skills: Array<{ id: string; name: string }> = []
): string {
  const headers = [
    "ID",
    "Nome",
    "Slug",
    "Cargo / Função",
    "Status",
    "Versão",
    "Objetivo",
    "Descrição",
    "Total de Skills",
    "Skills",
    "Permissões",
    "Data de Criação",
    "Última Atualização",
  ];

  const rows = agents.map((agent) => {
    const skillsNames = agent.skills
      ? agent.skills
          .map((skillId) => {
            const found = skills.find((s) => s.id === skillId);
            return found ? found.name : skillId;
          })
          .join("; ")
      : "";

    const permissionsList = agent.permissions ? agent.permissions.join("; ") : "";

    return [
      escapeCsv(agent.id),
      escapeCsv(agent.name),
      escapeCsv(agent.slug),
      escapeCsv(agent.roleTitle),
      escapeCsv(agent.status),
      escapeCsv(agent.version || "1.0.0"),
      escapeCsv(agent.objective),
      escapeCsv(agent.description),
      escapeCsv(agent.skills?.length || 0),
      escapeCsv(skillsNames),
      escapeCsv(permissionsList),
      escapeCsv(agent.createdAt || ""),
      escapeCsv(agent.updatedAt || ""),
    ].join(",");
  });

  return [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
}

export function downloadAgentsCsv(
  agents: Agent[],
  skills: Array<{ id: string; name: string }> = []
): void {
  if (typeof window === "undefined" || !agents || agents.length === 0) return;

  const csvContent = generateAgentsCsv(agents, skills);
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.setAttribute("download", `agentes-gag-core-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

