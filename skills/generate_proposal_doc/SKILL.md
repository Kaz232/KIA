---
name: generate_proposal_doc
description: Gera proposta comercial executiva em Kwanzas (AOA) com regra mandatória de 50% de sinal.
---

# Skill: generate_proposal_doc

## Descrição
Gera uma proposta comercial estruturada e pronta para envio pelo WhatsApp ou documento formal.

## Parâmetros
- `cliente_nome`: string (Nome do cliente ou empresa)
- `cliente_contacto`: string (Telefone com indicativo +244)
- `servico`: string (Identidade Visual, Vídeo 4K, Tráfego Pago, Automações)
- `valor_total_aoa`: number (Montante total em Kwanzas)
- `prazo_dias`: number (Prazo de execução)
- `condicoes`: string (ex.: "Sinal obrigatório de 50% na adjudicação; 50% na aprovação final")

## Execução
1. Modela a proposta comercial com cabeçalho executivo da GAG Visual em Luanda.
2. Calcula o sinal de 50% obrigatório em AOA e o saldo restante.
3. Formata com sintaxe otimizada para WhatsApp (*negrito*, marcadores limpos).
4. Regista a proposta no histórico de entregáveis do sistema.

## Output
- Proposta comercial formatada em Kwanzas (AOA) com regra inegociável de 50% de sinal.
- Link de ação e transbordo para o WhatsApp (`wa.me`).
