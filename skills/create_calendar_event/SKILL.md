---
name: create_calendar_event
description: Cria e agenda reuniões e marcos operacionais no Calendário da GAG Visual.
---

# Skill: create_calendar_event

## Descrição
Cria um evento, reunião executiva ou marco de entrega no Calendário Estratégico da GAG Visual.

## Parâmetros
- `titulo`: string (ex.: "Reunião de Alinhamento e Fecho de Proposta")
- `data_hora_inicio`: string (ISO 8601 ou formato legível)
- `data_hora_fim`: string (ISO 8601 ou formato legível)
- `descricao`: string (Ordem de trabalhos, objetivos e links)
- `convidados`: array de strings (Emails ou números de telefone)
- `tipo`: string ("REUNIAO", "ENTREGA", "PRODUCAO", "OPERACIONAL")

## Execução
1. Normaliza data e horário no fuso horário de Luanda (WAT / UTC+1).
2. Regista o evento no Calendário do GAG Core OS.
3. Alerta os participantes e o Diretor Comercial Josemar Gourgel (`+244 922 835 116`).

## Output
- Confirmação: "✅ Evento agendado: [titulo] para [data_hora_inicio]"
- Link / Acesso direto ao evento no Calendário
