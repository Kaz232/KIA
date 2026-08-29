/**
 * GAG CORE OS — FASE 2: CAPABILITY TYPES
 * Defines foundational capabilities, domain mappings, and dependencies.
 */

import { RiskLevel } from "./skillTypes";

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  domain:
    | "orchestration"
    | "strategy"
    | "architecture"
    | "document"
    | "pedagogy"
    | "visual"
    | "copywriting"
    | "automation"
    | "infrastructure"
    | "avatar"
    | "branding"
    | "marketing"
    | "support";
  requiredSkills: string[];
  requiredTools: string[];
  riskLevel: RiskLevel;
  enabled: boolean;
}

export interface CapabilityResolutionResult {
  goal: string;
  requiredCapabilities: string[];
  recommendedAgent: string;
  requiredSkills: string[];
  requiredTools: string[];
  riskLevel: RiskLevel;
  requiresOwnerApproval: boolean;
  approvalReason?: string;
}
