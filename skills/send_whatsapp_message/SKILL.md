---
name: send_whatsapp_message
description: Prepara mensagem formatada e gera link wa.me direto para envio e transbordo.
---

# Skill: send_whatsapp_message

## Descrição
Prepara uma mensagem corporativa e gera link direto do WhatsApp (`wa.me`) para envio imediato.

## Parâmetros
- `contacto`: string (Telefone do destinatário ou número oficial de transbordo `+244 922 835 116`)
- `mensagem`: string (Texto limpo, normalizado e com emojis executivos)
- `tipo`: string ("PROPOSTA", "TRANSBORDO", "FOLLOW_UP", "CONFIRMACAO")

## Execução
1. Limpa o contacto mantendo apenas dígitos com código internacional (ex.: `244922835116`).
2. Codifica a mensagem para URL seguro (`encodeURIComponent`).
3. Gera o link direto clicável: `https://wa.me/[contacto]?text=[mensagem]`.
4. Disponibiliza botão de 1 clique para disparar o WhatsApp.

## Output
- Link direto: `https://wa.me/[contacto]?text=[mensagem]`
- Ação de envio no chat com 1 clique
