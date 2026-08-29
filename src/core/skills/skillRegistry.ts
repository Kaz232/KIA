import { CoreSkill, ToolExecutionContext } from "../types";
import { ToolRegistry } from "../tools/toolRegistry";

export class SkillRegistry {
  private static instance: SkillRegistry;
  private skills: Map<string, CoreSkill> = new Map();

  private constructor() {
    this.registerCoreSkills();
  }

  public static getInstance(): SkillRegistry {
    if (!SkillRegistry.instance) {
      SkillRegistry.instance = new SkillRegistry();
    }
    return SkillRegistry.instance;
  }

  private registerCoreSkills() {
    const toolRegistry = ToolRegistry.getInstance();

    // 1. INTELLIGENCE: Decompose Task
    this.registerSkill({
      id: "skill_decompose_task",
      name: "Decomposição Estratégica de Tarefas",
      category: "INTELLIGENCE",
      description: "Decompõe um objetivo macro em 3 a 7 subtarefas sequenciais com dependências e atribuição de especialistas.",
      version: "1.0.0",
      requiredTools: ["tool_manage_memory"],
      permissions: ["write:tasks"],
      autonomyLevel: 0,
      inputSchema: { goal: "string", priority: "string" },
      outputSchema: { subtasks: "array", totalEstimatedMs: "number" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const goal = input.goal || "Objetivo Estratégico";
        const isCampaign = goal.toLowerCase().includes("campanha") || goal.toLowerCase().includes("marketing");
        const isSoftware = goal.toLowerCase().includes("software") || goal.toLowerCase().includes("app") || goal.toLowerCase().includes("código");

        if (isCampaign) {
          return [
            { step: 1, title: "Diagnóstico & Posicionamento TOB", agentId: "agent-consultant", skills: ["skill_brand_strategy"], deps: [] },
            { step: 2, title: "Redação da Sequência de Copywriting", agentId: "agent-copywriter", skills: ["skill_copywriting"], deps: [1] },
            { step: 3, title: "Roteiro & Prompts de Mídia", agentId: "agent-video-veo", skills: ["skill_scriptwriting", "skill_visual_prompt"], deps: [2] },
            { step: 4, title: "Validação de Qualidade QA", agentId: "agent-kia", skills: ["skill_qa"], deps: [3] },
          ];
        }

        if (isSoftware) {
          return [
            { step: 1, title: "Arquitetura & Especificação de Dados", agentId: "agent-brandkit", skills: ["skill_analyze_code"], deps: [] },
            { step: 2, title: "Implementação de Componentes Tailwind", agentId: "agent-brandkit", skills: ["skill_write_code"], deps: [1] },
            { step: 3, title: "Inspeção de Qualidade & Testes", agentId: "agent-kia", skills: ["skill_qa"], deps: [2] },
          ];
        }

        return [
          { step: 1, title: `Levantamento e Análise: ${goal}`, agentId: "agent-consultant", skills: ["skill_analyze"], deps: [] },
          { step: 2, title: "Elaboração do Entregável Principal", agentId: "agent-soba", skills: ["skill_generate_report"], deps: [1] },
          { step: 3, title: "Revisão e Validação QA", agentId: "agent-kia", skills: ["skill_qa"], deps: [2] },
        ];
      },
    });

    // 2. DOCUMENT: OCR & Invoice Analysis (Angola)
    this.registerSkill({
      id: "skill_ocr_document",
      name: "Scanner Forense de Faturas & Desperdício",
      category: "DOCUMENT",
      description: "Analisa contas de luz (ENDE), telecomunicações (Unitel, ZAP, DSTV) e relatórios bancários.",
      version: "1.2.0",
      requiredTools: ["tool_ocr_invoice"],
      permissions: ["read:documents"],
      autonomyLevel: 0,
      inputSchema: { text: "string", provider: "string" },
      outputSchema: { auditReport: "string", wasteScore: "number" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const ocrTool = toolRegistry.getTool("tool_ocr_invoice");
        if (!ocrTool) throw new Error("Ferramenta tool_ocr_invoice não disponível.");
        const res = await ocrTool.execute({ invoiceText: input.text, providerHint: input.provider }, context);
        return res.data;
      },
    });

    // 3. DATA: Calculate Finance & Taxes (Angola)
    this.registerSkill({
      id: "skill_calculate",
      name: "Cálculos Orçamentários & Fiscais Angolanos",
      category: "DATA",
      description: "Processa orçamentos, EBITDA, IVA (14%), Retenção na Fonte (6.5%) e métricas de ROAS.",
      version: "1.1.0",
      requiredTools: ["tool_calculate_finance"],
      permissions: ["math:execute"],
      autonomyLevel: 0,
      inputSchema: { revenueAOA: "number", cogsAOA: "number", opexAOA: "number" },
      outputSchema: { ebitdaAOA: "number", ivaEstimatedAOA: "number" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const mathTool = toolRegistry.getTool("tool_calculate_finance");
        if (!mathTool) throw new Error("Ferramenta tool_calculate_finance não disponível.");
        const res = await mathTool.execute(input, context);
        return res.data;
      },
    });

    // 4. GAG VISUAL: Copywriting High-Ticket (TOB)
    this.registerSkill({
      id: "skill_copywriting",
      name: "Copywriting de Resposta Direta & Fechamento",
      category: "GAG_VISUAL",
      description: "Produção de narrativas comerciais e sequências de e-mail pautadas no ecossistema TOB e regra de sinal 50%.",
      version: "2.0.0",
      requiredTools: ["tool_write_copy_sequence"],
      permissions: ["write:copy"],
      autonomyLevel: 0,
      inputSchema: { leadName: "string", painPoint: "string" },
      outputSchema: { emails: "array", formattedMarkdown: "string" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const copyTool = toolRegistry.getTool("tool_write_copy_sequence");
        if (!copyTool) throw new Error("Ferramenta tool_write_copy_sequence não disponível.");
        const res = await copyTool.execute(input, context);
        return res.data;
      },
    });

    // 5. OPERATIONS: QA Inspector
    this.registerSkill({
      id: "skill_qa",
      name: "Auditoria & Controlo de Qualidade Automático",
      category: "OPERATIONS",
      description: "Verifica rigorosamente formato, identidade GAG, completude e ausência de placeholders.",
      version: "1.0.0",
      requiredTools: ["tool_evaluate_qa"],
      permissions: ["audit:qa"],
      autonomyLevel: 1,
      inputSchema: { content: "string", taskType: "string" },
      outputSchema: { passed: "boolean", score: "number", feedback: "string" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const qaTool = toolRegistry.getTool("tool_evaluate_qa");
        if (!qaTool) throw new Error("Ferramenta tool_evaluate_qa não disponível.");
        const res = await qaTool.execute(input, context);
        return res.data;
      },
    });

    // 6. GAG VISUAL: Scriptwriting & Video Prompts
    this.registerSkill({
      id: "skill_scriptwriting",
      name: "Roteirização Audiovisual & Prompts Veo",
      category: "GAG_VISUAL",
      description: "Estruturação de roteiros em formato hook-história-oferta com prompts cinemáticos para Veo 2.",
      version: "1.0.0",
      requiredTools: ["tool_manage_memory"],
      permissions: ["write:scripts"],
      autonomyLevel: 0,
      inputSchema: { theme: "string", durationSec: "number" },
      outputSchema: { script: "string", cinematicPrompts: "array" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const theme = input.theme || "Inovação com Raízes GAG Visual";
        return {
          script: `[00:00-00:05] HOOK: "Enquanto a maioria se perde em ferramentas genéricas, a liderança em Angola avança com inteligência estruturada."\n[00:05-00:20] CORPO: "Na GAG Visual, unimos Tecnologia, Organização e Branding para transformar operações em máquinas de resultado."\n[00:20-00:30] CTA: "Descubra como o ecossistema TOB acelera a sua empresa. Toque no link abaixo."`,
          cinematicPrompts: [
            "Cinematic 4K shot of modern Luanda skyline at sunset, golden amber highlights, high contrast lighting, corporate aesthetic --ar 16:9",
            "Close-up of sleek glass workspace interface glowing in deep royal blue and gold accents, ultra-sharp focus --ar 16:9",
          ],
        };
      },
    });

    // 7. SOFTWARE: UI/UX Tailwind Components
    this.registerSkill({
      id: "skill_write_code",
      name: "Engenharia de Código UI/UX Dark Mode",
      category: "SOFTWARE",
      description: "Geração de código React e Tailwind CSS no padrão Dark Mode (#0A0A0F, #003FD3, #DAA520).",
      version: "1.0.0",
      requiredTools: ["tool_manage_memory"],
      permissions: ["write:code"],
      autonomyLevel: 0,
      inputSchema: { componentName: "string", specification: "string" },
      outputSchema: { tsxCode: "string" },
      handler: async (input: any, context: ToolExecutionContext) => {
        const name = input.componentName || "ExecutiveCard";
        return {
          tsxCode: `import React from 'react';\n\nexport const ${name}: React.FC = () => {\n  return (\n    <div className="p-6 bg-[#0A0A0F] border border-[#003FD3]/30 rounded-2xl shadow-xl">\n      <h3 className="text-sm font-bold text-amber-400">GAG Visual Core Component</h3>\n      <p className="text-xs text-slate-300 mt-2">Soluções com propósito, inovação com raízes.</p>\n    </div>\n  );\n};`,
        };
      },
    });
  }

  public getSkill(id: string): CoreSkill | undefined {
    return this.skills.get(id);
  }

  public getAllSkills(): CoreSkill[] {
    return Array.from(this.skills.values());
  }

  public registerSkill(skill: CoreSkill): void {
    this.skills.set(skill.id, skill);
  }
}
