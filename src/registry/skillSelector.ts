/**
 * GAG CORE OS — FASE 2: SKILL SELECTOR
 * Selects compatible skills matching the resolved capabilities and target agent.
 */

import { SkillDefinition } from "./skillTypes";
import { skillRegistry } from "./skillRegistry";
import { AGENT_CAPABILITY_MAP } from "./agentCapabilityMap";
import { capabilityResolver } from "./capabilityResolver";

export interface SkillSelectionResult {
  goal: string;
  targetAgentId: string;
  selectedSkills: SkillDefinition[];
  selectedSkillIds: string[];
  requiredTools: string[];
}

export class SkillSelector {
  private static instance: SkillSelector;

  public static getInstance(): SkillSelector {
    if (!SkillSelector.instance) {
      SkillSelector.instance = new SkillSelector();
    }
    return SkillSelector.instance;
  }

  /**
   * Selects skills compatible with target agent and goal.
   */
  public selectSkills(goal: string, targetAgentId?: string): SkillSelectionResult {
    const resolution = capabilityResolver.resolve(goal);
    const agentId = targetAgentId || resolution.recommendedAgent;
    const agentMapping = AGENT_CAPABILITY_MAP[agentId];

    const allowedSkills = agentMapping ? new Set(agentMapping.skills) : new Set<string>();
    const matchedSkills: SkillDefinition[] = [];
    const toolsSet = new Set<string>();

    for (const skillId of resolution.requiredSkills) {
      // Check if agent possesses or is authorized for this skill (or agent-kia fallback)
      if (agentId === "agent-kia" || allowedSkills.has(skillId)) {
        const skill = skillRegistry.get(skillId);
        if (skill && skill.enabled && skill.status === "AVAILABLE") {
          matchedSkills.push(skill);
          skill.requiredTools.forEach((t) => toolsSet.add(t));
        }
      }
    }

    // If no direct skills matched, fallback to goal-analysis
    if (matchedSkills.length === 0) {
      const fallbackSkill = skillRegistry.get("goal-analysis");
      if (fallbackSkill) {
        matchedSkills.push(fallbackSkill);
        fallbackSkill.requiredTools.forEach((t) => toolsSet.add(t));
      }
    }

    return {
      goal,
      targetAgentId: agentId,
      selectedSkills: matchedSkills,
      selectedSkillIds: matchedSkills.map((s) => s.id),
      requiredTools: Array.from(toolsSet),
    };
  }
}

export const skillSelector = SkillSelector.getInstance();
