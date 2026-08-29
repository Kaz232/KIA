import React from "react";
import {
  Bot,
  Crown,
  Briefcase,
  ScanText,
  GraduationCap,
  Sparkles,
  PenTool,
  Workflow,
  Network,
  Film,
  Palette,
  TrendingUp,
  Headphones,
  Cpu,
  Layers,
  LucideIcon,
} from "lucide-react";

export interface AgentVisualMetadata {
  icon: LucideIcon;
  gradient: string;
  badge: string;
  badgeColor: string;
  specialty: string;
  accentColor: string;
}

export const AGENT_AVATAR_MAP: Record<string, AgentVisualMetadata> = {
  "agent-kia": {
    icon: Crown,
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    badge: "Master Core",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    specialty: "Orquestração & Governança Executiva",
    accentColor: "#F59E0B",
  },
  "agent-soba": {
    icon: Cpu,
    gradient: "from-amber-500 via-orange-500 to-yellow-600",
    badge: "Arquiteto-Chefe",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    specialty: "Engenharia de Prompt & Agent Factory",
    accentColor: "#EAB308",
  },
  "agent-consultant": {
    icon: Briefcase,
    gradient: "from-indigo-500 via-blue-600 to-indigo-700",
    badge: "Estratégia & ROI",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    specialty: "Consultoria de Negócios & Propostas",
    accentColor: "#6366F1",
  },
  "agent-scanner": {
    icon: ScanText,
    gradient: "from-emerald-500 via-teal-600 to-emerald-700",
    badge: "OCR & Documentos",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    specialty: "Inteligência Documental & Extração",
    accentColor: "#10B981",
  },
  "agent-educator": {
    icon: GraduationCap,
    gradient: "from-blue-500 via-indigo-600 to-sky-600",
    badge: "Pedagógico",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    specialty: "Formação de Equipa & Curadoria",
    accentColor: "#3B82F6",
  },
  "agent-art-director": {
    icon: Sparkles,
    gradient: "from-purple-500 via-violet-600 to-fuchsia-600",
    badge: "Direção de Arte",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    specialty: "Motion Design & Cinema Veo 3.1",
    accentColor: "#8B5CF6",
  },
  "agent-copywriter": {
    icon: PenTool,
    gradient: "from-pink-500 via-rose-600 to-red-500",
    badge: "Copywriting",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    specialty: "Textos Persuasivos & Roteiros",
    accentColor: "#EC4899",
  },
  "agent-automation-kaza": {
    icon: Workflow,
    gradient: "from-cyan-500 via-teal-600 to-blue-600",
    badge: "Kaza Core",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    specialty: "Make, Supabase & Google Apps Script",
    accentColor: "#06B6D4",
  },
  "agent-infra-network": {
    icon: Network,
    gradient: "from-teal-500 via-emerald-600 to-cyan-700",
    badge: "Infra & Redes",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    specialty: "Cisco Packet Tracer & Cibersegurança",
    accentColor: "#14B8A6",
  },
  "agent-avatar-veo": {
    icon: Film,
    gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
    badge: "Avatares Veo 3",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40",
    specialty: "Face-Lock & Estética Angolana",
    accentColor: "#A855F7",
  },
  "agent-brandkit": {
    icon: Palette,
    gradient: "from-amber-500 via-yellow-600 to-orange-500",
    badge: "Brand Identity",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    specialty: "Paletas HEX, Tipografia & Manuais",
    accentColor: "#F59E0B",
  },
  "agent-campaigns": {
    icon: TrendingUp,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    badge: "Mídia & Tráfego",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    specialty: "ROAS, Testes A/B & Escala",
    accentColor: "#10B981",
  },
  "agent-support-ops": {
    icon: Headphones,
    gradient: "from-blue-500 via-sky-600 to-indigo-600",
    badge: "Suporte & Intake",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    specialty: "Typeform, HubSpot & Triagem Rápida",
    accentColor: "#3B82F6",
  },
};

export const getAgentVisualMetadata = (agentId: string, fallbackColor?: string): AgentVisualMetadata => {
  if (AGENT_AVATAR_MAP[agentId]) {
    return AGENT_AVATAR_MAP[agentId];
  }

  // Fallback for custom or generated agents
  return {
    icon: Bot,
    gradient: "from-amber-500 to-yellow-600",
    badge: "Agente IA",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    specialty: "Operações Especializadas GAG",
    accentColor: fallbackColor || "#F59E0B",
  };
};

interface AgentAvatarProps {
  agentId: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  avatarColor?: string;
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agentId,
  size = "md",
  showBadge = false,
  avatarColor,
  className = "",
}) => {
  const meta = getAgentVisualMetadata(agentId, avatarColor);
  const Icon = meta.icon;

  const sizeClasses = {
    xs: "w-6 h-6 rounded-md text-xs",
    sm: "w-8 h-8 rounded-lg text-sm",
    md: "w-10 h-10 rounded-xl text-base",
    lg: "w-12 h-12 rounded-2xl text-lg",
    xl: "w-14 h-14 rounded-2xl text-xl",
  };

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br ${meta.gradient} flex items-center justify-center font-bold text-black shadow-md border border-white/20 transition-transform`}
        style={avatarColor && !AGENT_AVATAR_MAP[agentId] ? { backgroundColor: avatarColor } : undefined}
      >
        <Icon className={`${iconSizes[size]} text-black drop-shadow-sm`} />
      </div>
      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 text-[8px] font-bold px-1.5 py-0.2 rounded-full border shadow-sm ${meta.badgeColor}`}
        >
          {meta.badge}
        </span>
      )}
    </div>
  );
};
