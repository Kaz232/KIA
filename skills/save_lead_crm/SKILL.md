---
name: save_lead_crm
description: Guarda e qualifica um lead no CRM da GAG Visual com sincronização imediata.
---

# Skill: save_lead_crm

## Descrição
Guarda um lead no CRM / Base de Leads da GAG Visual em Luanda.

## Parâmetros
- `nome`: string (Nome do cliente ou decisor)
- `contacto`: string (Telefone com indicativo +244 ou internacional)
- `empresa`: string (Nome da empresa/instituição)
- `servico`: string (Branding, Audiovisual 4K, Tráfego Pago, Automações)
- `valor`: number (Valor estimado em AOA)
- `status`: string ("Novo", "Qualificado", "Proposta Enviada", "Fecho", "Sinal Recebido")

## Execução
Ao receber os parâmetros:
1. Valida o contacto (+244) e dados do cliente.
2. Regista o lead no repositório de Leads/CRM com timestamp automático.
3. Cria tarefa de acompanhamento para o Diretor Comercial (`+244 922 835 116`).
4. Define status inicial como "Qualificado" ou "Novo".

## Output
- Confirmação: "✅ Lead registado: [nome] ([empresa]) - [valor] AOA"
- Referência de auditoria e registo no CRM
