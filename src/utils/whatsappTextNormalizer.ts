/**
 * GAG CORE OS — WHATSAPP & Z-API MULTICHANNEL TEXT NORMALIZER
 * 
 * Cleans, normalizes and formats inbound/outbound messages for WhatsApp / Z-API:
 * - Strips complex markdown (tables, code blocks, deep headers) for clean mobile readability.
 * - Converts markdown tables into elegant mobile bullet points.
 * - Converts markdown bold (**text**) to WhatsApp bold (*text*).
 * - Normalizes phone numbers to standard E.164 (+244...).
 * - Unifies inbound payloads from Z-API, Meta Cloud API and Make.com webhooks.
 */

export interface NormalizedInboundMessage {
  senderNumber: string;
  senderName: string;
  messageText: string;
  channel: "Z-API" | "Meta WhatsApp Cloud" | "Make.com Webhook" | "Manual";
  rawPayload: any;
  messageId: string;
  timestamp: string;
}

/**
 * Normalizes phone numbers into E.164 international format (+244...)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "+244 900 000 000";
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  
  // Standard Angola number without country code
  if (digitsOnly.length === 9 && digitsOnly.startsWith("9")) {
    return `+244 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  }
  
  // With 244 prefix
  if (digitsOnly.startsWith("244") && digitsOnly.length === 12) {
    const local = digitsOnly.slice(2);
    return `+244 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  // Already prefixed or other international
  if (phone.trim().startsWith("+")) {
    return phone.trim();
  }
  return `+${digitsOnly}`;
}

/**
 * Parses diverse incoming payloads (Z-API, Meta, Make) into a standardized format.
 */
export function normalizeInboundWhatsAppPayload(body: any): NormalizedInboundMessage {
  const timestamp = new Date().toISOString();
  const rawPayload = body || {};

  // 1. Z-API Payload Standard
  // Format: { phone: "244923456789", senderName: "Nome", text: { message: "Olá" }, isGroup: false }
  // or { phone: "...", message: "..." }
  if (rawPayload.phone || (rawPayload.text && typeof rawPayload.text.message === "string")) {
    const phone = rawPayload.phone || rawPayload.from || rawPayload.chatId || "";
    const text = rawPayload.text?.message || rawPayload.message || rawPayload.body || "";
    const senderName = rawPayload.senderName || rawPayload.contactName || rawPayload.name || "Cliente WhatsApp (Z-API)";
    
    return {
      senderNumber: normalizePhoneNumber(phone),
      senderName,
      messageText: cleanIncomingText(text),
      channel: "Z-API",
      rawPayload,
      messageId: rawPayload.messageId || rawPayload.id || `zapi_${Date.now()}`,
      timestamp,
    };
  }

  // 2. Meta WhatsApp Cloud API Standard
  // Format: { entry: [{ changes: [{ value: { messages: [...], contacts: [...] } }] }] }
  if (rawPayload.entry && rawPayload.entry[0]?.changes && rawPayload.entry[0].changes[0]?.value) {
    const value = rawPayload.entry[0].changes[0].value;
    let senderName = "Cliente WhatsApp";
    let senderNumber = "+244 9XX XXX XXX";
    let text = "";

    if (value.contacts && value.contacts[0]) {
      senderName = value.contacts[0].profile?.name || senderName;
      senderNumber = value.contacts[0].wa_id ? `+${value.contacts[0].wa_id}` : senderNumber;
    }
    if (value.messages && value.messages[0]) {
      text = value.messages[0].text?.body || value.messages[0].caption || "";
    }

    return {
      senderNumber: normalizePhoneNumber(senderNumber),
      senderName,
      messageText: cleanIncomingText(text),
      channel: "Meta WhatsApp Cloud",
      rawPayload,
      messageId: value.messages?.[0]?.id || `meta_${Date.now()}`,
      timestamp,
    };
  }

  // 3. Make.com Webhook or Generic JSON
  const genericPhone = rawPayload.senderNumber || rawPayload.sender || rawPayload.recipientNumber || rawPayload.from || "+244 923 000 000";
  const genericName = rawPayload.senderName || rawPayload.name || "Contacto WhatsApp";
  const genericText = rawPayload.message || rawPayload.text || rawPayload.content || "";

  return {
    senderNumber: normalizePhoneNumber(genericPhone),
    senderName: genericName,
    messageText: cleanIncomingText(genericText),
    channel: "Make.com Webhook",
    rawPayload,
    messageId: rawPayload.id || `msg_${Date.now()}`,
    timestamp,
  };
}

/**
 * Strips zero-width characters and invisible noise from incoming text
 */
function cleanIncomingText(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * Converts rich markdown (with tables, triple backticks, header tags)
 * into clean, readable mobile text for WhatsApp.
 */
export function normalizeMarkdownForWhatsApp(markdownText: string): string {
  if (!markdownText) return "";

  let result = markdownText;

  // 1. Convert Markdown Tables into clean bullet points with bold field names
  // Matches markdown table blocks: lines starting and ending with |
  result = result.replace(/(?:^\|.+?\|$\n?)+/gm, (tableMatch) => {
    const lines = tableMatch.trim().split("\n");
    if (lines.length < 2) return tableMatch;

    // Parse header row
    const headers = lines[0]
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    // Skip separator row (e.g. |---|---|)
    const contentRows = lines.slice(1).filter((l) => !l.match(/^\|[\s:-|-]+\|$/));

    const formattedRows: string[] = [];

    contentRows.forEach((row) => {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      if (cells.length > 0) {
        if (headers.length >= 2 && cells.length >= 2) {
          // Primary item + secondary info
          const title = cells[0];
          const details = cells
            .slice(1)
            .map((c, i) => `${headers[i + 1] || "Info"}: ${c}`)
            .join(" | ");
          formattedRows.push(`• *${title}* — ${details}`);
        } else {
          formattedRows.push(`• ${cells.join(" — ")}`);
        }
      }
    });

    return formattedRows.length > 0 ? `\n${formattedRows.join("\n")}\n` : "";
  });

  // 2. Convert Triple Backtick Code Blocks to clean indented text
  result = result.replace(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_match, codeContent) => {
    const cleaned = codeContent.trim();
    return `\n${cleaned}\n`;
  });

  // 3. Convert Single Inline Backticks to standard single quotes
  result = result.replace(/`([^`]+)`/g, "*$1*");

  // 4. Convert Markdown Headers (# Title, ## Subtitle) to WhatsApp Uppercase Bold
  result = result.replace(/^#{1,6}\s*(.+)$/gm, "*$1*");

  // 5. Convert Double Asterisks (**bold**) to WhatsApp Single Asterisk (*bold*)
  result = result.replace(/\*\*([^*]+)\*\*/g, "*$1*");

  // 6. Convert Markdown Links [Title](url) to "Title (url)"
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // 7. Ensure bullet points look neat on mobile
  result = result.replace(/^\s*[-*]\s+/gm, "• ");

  // 8. Collapse excessive linebreaks to maximum 2
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}
