/**
 * GAG VISUAL CORE OS — DOCUMENT EXPORT & BRAND IDENTITY ENGINE
 * Luanda, Angola — Direção Executiva: Josemar Gourgel
 * Generates executive-ready corporate documents across all formats:
 * PDF (Print A4), DOCX/Word, Markdown, HTML Standalone, WhatsApp, JSON, CSV.
 */
import { GagDocumentData, GagDocumentItem } from "../types";

export interface GagBrandIdentity {
  companyName: string;
  corporateName: string;
  tagline: string;
  managingDirector: string;
  email: string;
  phone: string;
  nif: string;
  address: string;
  bankName: string;
  iban: string;
  multicaixaEntity?: string;
  multicaixaRef?: string;
  primaryGold: string;
  secondaryAmber: string;
  darkOnyx: string;
  customLogoUrl?: string;
}

export const GAG_BRAND_DEFAULTS: GagBrandIdentity = {
  companyName: "GAG Visual",
  corporateName: "GAG Visual (Josemar Lukeni Gaspar do Amaral Gourgel — SU Lda.)",
  tagline: "Soluções com propósito, inovações com raízes. Gerar, acolher e gerir.",
  managingDirector: "Josemar Gourgel (Director Geral)",
  email: "gagvisualcorp@gmail.com",
  phone: "+244 922 835 116",
  nif: "5001654063",
  address: "Centralidade do Kilamba, Luanda, Angola",
  bankName: "Banco Angolano de Investimentos (BAI)",
  iban: "AO06.0040.0000.1234.5678.1012.3",
  multicaixaEntity: "10234",
  multicaixaRef: "987 654 321",
  primaryGold: "#DAA520",
  secondaryAmber: "#F59E0B",
  darkOnyx: "#05070c",
};

export const GAG_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="120" height="72">
  <defs>
    <linearGradient id="gagBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A6BFF"/>
      <stop offset="45%" stop-color="#0047E0"/>
      <stop offset="100%" stop-color="#002888"/>
    </linearGradient>
    <linearGradient id="gagSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#D8E2EC"/>
      <stop offset="70%" stop-color="#8A99AD"/>
      <stop offset="100%" stop-color="#556477"/>
    </linearGradient>
    <radialGradient id="gagLensCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="35%" stop-color="#1D4ED8"/>
      <stop offset="80%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <filter id="gagDropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Left G (Royal Blue) -->
  <path d="M 125,50 C 75,50 48,82 48,120 C 48,158 78,190 125,190 C 145,190 162,183 172,172 L 172,135 L 122,135 L 122,112 L 195,112 L 195,185 C 176,205 152,212 125,212 C 62,212 24,172 24,120 C 24,68 65,28 125,28 C 152,28 174,38 190,52 L 170,72 C 158,60 142,50 125,50 Z" 
        fill="url(#gagBlueGrad)" filter="url(#gagDropShadow)"/>

  <!-- Center Triangle A with Camera Aperture (Silver Metallic) -->
  <polygon points="200,28 255,142 145,142" fill="none" stroke="url(#gagSilverGrad)" stroke-width="26" stroke-linejoin="miter" filter="url(#gagDropShadow)"/>
  <polygon points="200,45 242,135 158,135" fill="#0A0F1D"/>

  <!-- Camera Aperture Lens -->
  <g transform="translate(200, 118)">
    <circle cx="0" cy="0" r="28" fill="#1E293B" stroke="url(#gagSilverGrad)" stroke-width="2.5"/>
    <!-- Shutter Blades -->
    <path d="M 0,-24 L 14,-10 L -4,-8 Z" fill="#64748B"/>
    <path d="M 21,-12 L 20,8 L 4,0 Z" fill="#475569"/>
    <path d="M 21,12 L 4,21 L 4,3 Z" fill="#64748B"/>
    <path d="M 0,24 L -14,10 L 4,8 Z" fill="#475569"/>
    <path d="M -21,12 L -20,-8 L -4,0 Z" fill="#64748B"/>
    <path d="M -21,-12 L -4,-21 L -4,-3 Z" fill="#475569"/>
    <!-- Core Blue Iris -->
    <circle cx="0" cy="0" r="12" fill="url(#gagLensCore)"/>
    <circle cx="-3" cy="-3" r="3.5" fill="#93C5FD" opacity="0.8"/>
  </g>

  <!-- Right G (Royal Blue) -->
  <path d="M 325,50 C 275,50 248,82 248,120 C 248,158 278,190 325,190 C 345,190 362,183 372,172 L 372,135 L 322,135 L 322,112 L 395,112 L 395,185 C 376,205 352,212 325,212 C 262,212 224,172 224,120 C 224,68 265,28 325,28 C 352,28 374,38 390,52 L 370,72 C 358,60 342,50 325,50 Z" 
        fill="url(#gagBlueGrad)" filter="url(#gagDropShadow)"/>

  <!-- V I S U A L stylized text -->
  <text x="200" y="226" font-family="'Montserrat', 'Arial Black', sans-serif" font-weight="900" font-size="20" fill="url(#gagSilverGrad)" text-anchor="middle" letter-spacing="14">VISUAL</text>
</svg>
`;

export function formatAOA(amount: number): string {
  return new Intl.NumberFormat("pt-AO", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " AOA";
}

export interface DocumentFinancials {
  subtotal: number;
  urgencyFee: number;
  taxRetention6_5: number;
  iva14: number;
  totalGross: number;
  totalNet: number;
  deposit50Percent: number;
  balance50Percent: number;
}

export function calculateDocumentFinancials(doc: GagDocumentData): DocumentFinancials {
  let subtotal = 0;
  if (doc.items && doc.items.length > 0) {
    subtotal = doc.items.reduce((acc, it) => acc + (it.totalAOA || 0), 0);
  } else if (doc.totalAmountAOA) {
    subtotal = doc.totalAmountAOA;
  } else {
    subtotal = 2500000; // Default base 2.500.000 AOA
  }

  const urgencyFee = doc.urgency48h ? subtotal * 0.5 : 0;
  const taxableBase = subtotal + urgencyFee;
  const iva14 = doc.includeIVA ? taxableBase * 0.14 : 0;
  const taxRetention6_5 = doc.includeTaxRetention ? taxableBase * 0.065 : 0;

  const totalGross = taxableBase + iva14;
  const totalNet = totalGross - taxRetention6_5;

  const deposit50Percent = totalGross * 0.5;
  const balance50Percent = totalGross * 0.5;

  return {
    subtotal,
    urgencyFee,
    taxRetention6_5,
    iva14,
    totalGross,
    totalNet,
    deposit50Percent,
    balance50Percent,
  };
}

/**
 * 1. EXPORT AS PDF (High-fidelity A4 Print Isolation)
 */
export function exportDocumentAsPdf(doc: GagDocumentData, brand: GagBrandIdentity = GAG_BRAND_DEFAULTS) {
  const fin = calculateDocumentFinancials(doc);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor, permita popups para gerar a impressão em PDF oficial da GAG Visual.");
    return;
  }

  const itemsHtml = (doc.items && doc.items.length > 0)
    ? doc.items.map((it, idx) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${idx + 1}. ${it.description}</strong>
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #475569;">
          ${it.quantity || 1}
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">
          ${formatAOA(it.unitPriceAOA)}
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">
          ${formatAOA(it.totalAOA)}
        </td>
      </tr>
    `).join("")
    : `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>Desenvolvimento e Execução de Projeto Estratégico Multimodal</strong>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Identidade visual, produção audiovisual cinematográfica e posicionamento digital em Luanda.</div>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #475569;">1</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">${formatAOA(fin.subtotal)}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">${formatAOA(fin.subtotal)}</td>
      </tr>
    `;

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <title>${doc.title} — GAG Visual Official Document</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }

    .doc-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px 36px;
      position: relative;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #DAA520;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-info h1 {
      font-family: 'Montserrat', sans-serif;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1.5px;
      color: #05070c;
      margin: 0;
    }

    .brand-info .tagline {
      font-size: 11px;
      color: #b45309;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .brand-info .location {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .doc-badge {
      text-align: right;
    }

    .doc-type-pill {
      display: inline-block;
      padding: 6px 14px;
      background: #05070c;
      color: #DAA520;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      border-radius: 6px;
      text-transform: uppercase;
      border: 1px solid #DAA520;
    }

    .doc-meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
    }

    .client-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #DAA520;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .client-card .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .client-card .val {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }

    .doc-title-section {
      margin-bottom: 20px;
    }

    .doc-title-section h2 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 700;
      color: #05070c;
      margin: 0 0 8px 0;
    }

    .summary-text {
      font-size: 13px;
      color: #334155;
      line-height: 1.6;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 12px 16px;
      border-radius: 6px;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #ffffff;
    }

    table.data-table th {
      background: #05070c;
      color: #f8fafc;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 10px 14px;
      text-align: left;
    }

    .fin-box {
      margin-left: auto;
      width: 340px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      margin-top: 16px;
      margin-bottom: 24px;
    }

    .fin-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      color: #475569;
    }

    .fin-row.highlight {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 6px;
      font-size: 14px;
      font-weight: 800;
      color: #05070c;
    }

    .deposit-callout {
      background: #05070c;
      color: #ffffff;
      border: 2px solid #DAA520;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .deposit-callout .left-text {
      font-size: 12px;
      color: #e2e8f0;
    }

    .deposit-callout .left-text strong {
      color: #f59e0b;
      font-size: 13px;
      display: block;
      margin-bottom: 2px;
    }

    .deposit-callout .amount {
      font-family: 'Montserrat', sans-serif;
      font-size: 18px;
      font-weight: 900;
      color: #DAA520;
    }

    .bank-details {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 11px;
      color: #334155;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .bank-details strong {
      color: #0f172a;
    }

    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .signature-block {
      text-align: center;
    }

    .sig-line {
      border-bottom: 1px solid #0f172a;
      width: 80%;
      margin: 36px auto 8px auto;
    }

    .sig-name {
      font-weight: 700;
      font-size: 12px;
      color: #0f172a;
    }

    .sig-role {
      font-size: 11px;
      color: #64748b;
    }

    .footer-note {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
    }

    @media print {
      body {
        padding: 0;
        background: none;
      }
      .doc-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 16px auto; display: flex; justify-content: space-between; align-items: center; background: #05070c; padding: 12px 20px; border-radius: 8px; border: 1px solid #DAA520;">
    <div style="color: #ffffff; font-size: 13px;">
      <strong style="color: #DAA520;">GAG Visual OS</strong> — Visualização Oficial de Impressão / PDF
    </div>
    <div>
      <button onclick="window.print()" style="background: #DAA520; color: #05070c; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 12px;">
        🖨️ Imprimir / Guardar como PDF
      </button>
    </div>
  </div>

  <div class="doc-container">
    <div class="header-bar">
      <div class="brand-left">
        ${GAG_LOGO_SVG}
        <div class="brand-info">
          <h1>GAG VISUAL</h1>
          <div class="tagline">${brand.tagline}</div>
          <div class="location">${brand.address} • NIF: ${doc.nif || brand.nif}</div>
        </div>
      </div>
      <div class="doc-badge">
        <span class="doc-type-pill">${doc.type.replace(/_/g, " ")}</span>
        <div class="doc-meta">
          <strong>Data:</strong> ${doc.date || new Date().toLocaleDateString("pt-PT")}<br/>
          <strong>Ref:</strong> GAG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}<br/>
          <strong>Validade:</strong> ${doc.validityDays || 15} dias
        </div>
      </div>
    </div>

    <div class="client-card">
      <div>
        <div class="label">Destinatário / Cliente</div>
        <div class="val">${doc.clientName || "Direção Executiva"}</div>
        <div style="font-size: 12px; color: #64748b;">${doc.companyName || "Empresa Cliente"}</div>
      </div>
      <div>
        <div class="label">Coordenadas & Contacto</div>
        <div class="val">${doc.clientPhone || "+244 (Não especificado)"}</div>
        <div style="font-size: 12px; color: #64748b;">${doc.clientEmail || "Luanda, Angola"}</div>
      </div>
    </div>

    <div class="doc-title-section">
      <h2>${doc.title}</h2>
      <div class="summary-text">
        ${doc.summary || "Documento oficial de alinhamento estratégico, especificações de projeto e termos comerciais."}
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 55%;">Descrição do Entregável / Escopo</th>
          <th style="width: 10%; text-align: center;">Qtd</th>
          <th style="width: 17%; text-align: right;">Preço Unitário</th>
          <th style="width: 18%; text-align: right;">Total (AOA)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="fin-box">
      <div class="fin-row">
        <span>Subtotal Escopo:</span>
        <span>${formatAOA(fin.subtotal)}</span>
      </div>
      ${doc.urgency48h ? `
      <div class="fin-row" style="color: #b45309; font-weight: 600;">
        <span>Taxa Urgência 48h (+50%):</span>
        <span>${formatAOA(fin.urgencyFee)}</span>
      </div>
      ` : ""}
      ${doc.includeIVA ? `
      <div class="fin-row">
        <span>IVA (14% Lei Geral):</span>
        <span>${formatAOA(fin.iva14)}</span>
      </div>
      ` : ""}
      ${doc.includeTaxRetention ? `
      <div class="fin-row" style="color: #dc2626;">
        <span>Retenção na Fonte (6,5% RGIR):</span>
        <span>- ${formatAOA(fin.taxRetention6_5)}</span>
      </div>
      ` : ""}
      <div class="fin-row highlight">
        <span>VALOR GLOBAL:</span>
        <span style="color: #DAA520;">${formatAOA(doc.includeTaxRetention ? fin.totalNet : fin.totalGross)}</span>
      </div>
    </div>

    <div class="deposit-callout">
      <div class="left-text">
        <strong>REQUISITO INEGOCIÁVEL DE ADJUDICAÇÃO (LUANDA, ANGOLA):</strong>
        Sinal obrigatório de 50% para mobilização da equipa criativa e reserva de agenda técnica.
      </div>
      <div style="text-align: right;">
        <div style="font-size: 10px; text-transform: uppercase; color: #cbd5e1; letter-spacing: 0.5px;">Sinal Obrigatório (50%)</div>
        <div class="amount">${formatAOA(fin.deposit50Percent)}</div>
      </div>
    </div>

    <div class="bank-details">
      <strong>Coordenadas Bancárias para Liquidação do Sinal:</strong><br/>
      Instituição Financeira: <strong>${doc.bankName || brand.bankName}</strong><br/>
      IBAN: <strong style="font-family: monospace; letter-spacing: 1px;">${doc.iban || brand.iban}</strong><br/>
      ${brand.multicaixaEntity ? `Referência Multicaixa: <strong>Entidade: ${brand.multicaixaEntity} | Ref: ${brand.multicaixaRef || '987 654 321'}</strong><br/>` : ''}
      Titular da Conta: <strong>${brand.corporateName} / ${brand.managingDirector}</strong><br/>
      Comprovativo para: <strong>${brand.email}</strong> ou WhatsApp <strong>${brand.phone}</strong>
    </div>

    <div class="signatures-grid">
      <div class="signature-block">
        <div class="sig-line"></div>
        <div class="sig-name">${brand.managingDirector}</div>
        <div class="sig-role">Diretor Geral & Comercial — GAG Visual</div>
      </div>
      <div class="signature-block">
        <div class="sig-line"></div>
        <div class="sig-name">${doc.clientName || "Representante Homologador"}</div>
        <div class="sig-role">${doc.companyName || "Empresa Contratante"}</div>
      </div>
    </div>

    <div class="footer-note">
      Documento gerado e autenticado pela KIA — Assistente Executiva do GAG Visual Core OS v2.4.<br/>
      Edifício Masuika Office Park, Luanda, Angola • contacto: ${brand.phone} • ${brand.email}
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * 2. EXPORT AS DOCX / WORD (.doc / .docx compatible XML)
 */
export function exportDocumentAsDocx(doc: GagDocumentData, brand: GagBrandIdentity = GAG_BRAND_DEFAULTS) {
  const fin = calculateDocumentFinancials(doc);

  const itemsRows = (doc.items && doc.items.length > 0)
    ? doc.items.map((it, idx) => `
      <tr>
        <td style="padding: 8pt; border: 1pt solid #cccccc;"><strong>${idx + 1}. ${it.description}</strong></td>
        <td style="padding: 8pt; border: 1pt solid #cccccc; text-align: center;">${it.quantity || 1}</td>
        <td style="padding: 8pt; border: 1pt solid #cccccc; text-align: right;">${formatAOA(it.unitPriceAOA)}</td>
        <td style="padding: 8pt; border: 1pt solid #cccccc; text-align: right; font-weight: bold;">${formatAOA(it.totalAOA)}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td style="padding: 8pt; border: 1pt solid #cccccc;"><strong>Projeto Estratégico Multimodal</strong></td>
        <td style="padding: 8pt; border: 1pt solid #cccccc; text-align: center;">1</td>
        <td style="padding: 8pt; border: 1pt solid #cccccc; text-align: right;">${formatAOA(fin.subtotal)}</td>
        <td style="padding: 8pt; border: 1pt solid #cccccc; text-align: right; font-weight: bold;">${formatAOA(fin.subtotal)}</td>
      </tr>
    `;

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${doc.title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #111827; }
    h1 { font-family: 'Arial Black', 'Helvetica', sans-serif; font-size: 20pt; color: #05070c; margin-bottom: 2pt; }
    h2 { font-size: 14pt; color: #b45309; margin-top: 14pt; }
    .header-gold { border-bottom: 3pt solid #DAA520; padding-bottom: 8pt; margin-bottom: 12pt; }
    .callout { background: #fdf8ee; border: 1pt solid #DAA520; padding: 10pt; margin: 12pt 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
    th { background: #05070c; color: #ffffff; padding: 6pt; font-size: 10pt; text-align: left; }
  </style>
</head>
<body>
  <div class="header-gold">
    <h1>GAG VISUAL</h1>
    <p style="color: #b45309; font-weight: bold; margin: 0;">${brand.tagline}</p>
    <p style="color: #6b7280; font-size: 9pt; margin: 2pt 0 0 0;">${brand.address} | NIF: ${doc.nif || brand.nif} | Contacto: ${brand.phone}</p>
  </div>

  <p><strong>DOCUMENTO:</strong> ${doc.title} (${doc.type})</p>
  <p><strong>DATA:</strong> ${doc.date || new Date().toLocaleDateString("pt-PT")} | <strong>VALIDADE:</strong> ${doc.validityDays || 15} dias</p>
  <p><strong>CLIENTE:</strong> ${doc.clientName} — ${doc.companyName} (${doc.clientPhone || "Sem telefone"})</p>

  <div class="callout">
    <strong>RESUMO EXECUTIVO:</strong><br/>
    ${doc.summary || "Proposta e documentação emitida pelo ecossistema GAG Visual."}
  </div>

  <h2>ESCOPO & DETALHAMENTO DE VALORES</h2>
  <table>
    <thead>
      <tr>
        <th>Descrição</th>
        <th style="text-align: center;">Qtd</th>
        <th style="text-align: right;">Preço Unitário</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div style="margin-top: 14pt; text-align: right;">
    <p>Subtotal: <strong>${formatAOA(fin.subtotal)}</strong></p>
    ${doc.urgency48h ? `<p>Taxa Urgência 48h (+50%): <strong>${formatAOA(fin.urgencyFee)}</strong></p>` : ""}
    ${doc.includeIVA ? `<p>IVA (14%): <strong>${formatAOA(fin.iva14)}</strong></p>` : ""}
    ${doc.includeTaxRetention ? `<p>Retenção na Fonte (6,5%): <strong>-${formatAOA(fin.taxRetention6_5)}</strong></p>` : ""}
    <p style="font-size: 14pt; color: #b45309;"><strong>VALOR TOTAL GLOBAL: ${formatAOA(doc.includeTaxRetention ? fin.totalNet : fin.totalGross)}</strong></p>
  </div>

  <div class="callout" style="background: #f1f5f9; border-color: #0f172a;">
    <strong>TERMO DE ADJUDICAÇÃO OBRIGATÓRIO (LUANDA):</strong><br/>
    • Sinal de Início (50%): <strong>${formatAOA(fin.deposit50Percent)}</strong><br/>
    • Saldo na Homologação Final (50%): <strong>${formatAOA(fin.balance50Percent)}</strong><br/>
    • Coordenadas Bancárias: <strong>${doc.bankName || brand.bankName}</strong> | IBAN: <strong>${doc.iban || brand.iban}</strong>
  </div>

  <br/><br/>
  <table style="border: none;">
    <tr>
      <td style="border: none; text-align: center; width: 50%;">
        __________________________________________<br/>
        <strong>${brand.managingDirector}</strong><br/>
        Diretor Geral & Comercial — GAG Visual
      </td>
      <td style="border: none; text-align: center; width: 50%;">
        __________________________________________<br/>
        <strong>${doc.clientName || "Representante do Cliente"}</strong><br/>
        ${doc.companyName || "Homologação Comercial"}
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const blob = new Blob(["\ufeff" + wordContent], { type: "application/msword" });
  triggerFileDownload(blob, `${slugify(doc.title)}.doc`);
}

/**
 * 3. EXPORT AS MARKDOWN (.md)
 */
export function exportDocumentAsMarkdown(doc: GagDocumentData, brand: GagBrandIdentity = GAG_BRAND_DEFAULTS) {
  const fin = calculateDocumentFinancials(doc);

  const itemsMd = (doc.items && doc.items.length > 0)
    ? doc.items.map((it, idx) => `| ${idx + 1} | ${it.description} | ${it.quantity || 1} | ${formatAOA(it.unitPriceAOA)} | ${formatAOA(it.totalAOA)} |`).join("\n")
    : `| 1 | Projeto Estratégico Multimodal | 1 | ${formatAOA(fin.subtotal)} | ${formatAOA(fin.subtotal)} |`;

  const md = `---
title: "${doc.title}"
type: "${doc.type}"
client: "${doc.clientName}"
company: "${doc.companyName}"
date: "${doc.date || new Date().toLocaleDateString("pt-PT")}"
author: "${doc.author || brand.managingDirector}"
brand: "${brand.companyName}"
currency: "AOA"
deposit_rule: "50% Sinal Obrigatório"
---

# 👑 GAG VISUAL — ${doc.title.toUpperCase()}
> **${brand.tagline}**  
> ${brand.address} | NIF: ${doc.nif || brand.nif} | Tel: ${brand.phone}

---

### 📋 Metadados do Documento
- **Cliente / Decisor:** ${doc.clientName}
- **Empresa / Marca:** ${doc.companyName}
- **Contacto:** ${doc.clientPhone || "Sem telefone"} | ${doc.clientEmail || "Luanda, Angola"}
- **Data de Emissão:** ${doc.date || new Date().toLocaleDateString("pt-PT")}
- **Validade da Proposta:** ${doc.validityDays || 15} dias

---

### 🎯 Resumo Executivo & Diagnóstico
${doc.summary || "Documento oficial de entrega, escopo e termos comerciais da GAG Visual."}

---

### 📊 Detalhamento de Entregáveis e Valores (Kwanzas)

| # | Descrição do Escopo | Qtd | Valor Unitário | Total (AOA) |
|---|---|:---:|---:|---:|
${itemsMd}

#### 💰 Síntese Financeira & Fiscal
- **Subtotal:** ${formatAOA(fin.subtotal)}
${doc.urgency48h ? `- **Taxa de Urgência 48h (+50%):** ${formatAOA(fin.urgencyFee)}\n` : ""}${doc.includeIVA ? `- **IVA (14%):** ${formatAOA(fin.iva14)}\n` : ""}${doc.includeTaxRetention ? `- **Retenção na Fonte (6,5% RGIR):** -${formatAOA(fin.taxRetention6_5)}\n` : ""}- **VALOR TOTAL GLOBAL:** **${formatAOA(doc.includeTaxRetention ? fin.totalNet : fin.totalGross)}**

---

### ⚖️ Condições Comerciais Obrigatórias (Luanda, Angola)
1. **Sinal de 50% na Adjudicação:** ${formatAOA(fin.deposit50Percent)} (Condição inegociável para início de produção e reserva de pauta).
2. **Saldo de 50%:** ${formatAOA(fin.balance50Percent)} (Liquidado contra homologação dos ativos finais).
3. **Coordenadas Bancárias:**
   - **Banco:** ${doc.bankName || brand.bankName}
   - **IBAN:** \`${doc.iban || brand.iban}\`
   ${brand.multicaixaEntity ? `- **Referência Multicaixa:** Entidade \`${brand.multicaixaEntity}\` | Ref \`${brand.multicaixaRef || "987 654 321"}\`\n` : ""}- **Titular:** ${brand.corporateName} / ${brand.managingDirector}

---

### ✍️ Homologação & Assinaturas

\`\`\`
[ ASSINADO DIGITALMENTE ]
Diretor Geral & Comercial: ${brand.managingDirector}
GAG Visual Core OS v2.4

Homologação do Cliente: ____________________________________
Data: ____ / ____ / ________
\`\`\`
`;

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  triggerFileDownload(blob, `${slugify(doc.title)}.md`);
}

/**
 * 4. EXPORT AS HTML (Standalone Corporate Web Page)
 */
export function exportDocumentAsHtml(doc: GagDocumentData, theme: "dark" | "light" = "dark", brand: GagBrandIdentity = GAG_BRAND_DEFAULTS) {
  const fin = calculateDocumentFinancials(doc);
  const isDark = theme === "dark";

  const bg = isDark ? "#05070c" : "#f8fafc";
  const cardBg = isDark ? "#090d16" : "#ffffff";
  const textColor = isDark ? "#f8fafc" : "#0f172a";
  const subTextColor = isDark ? "#94a3b8" : "#475569";
  const borderColor = isDark ? "#1e293b" : "#e2e8f0";

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${doc.title} — GAG Visual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Inter:wght@400;500;600&display=swap');
    body {
      background: ${bg};
      color: ${textColor};
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 30px 15px;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 850px;
      margin: 0 auto;
      background: ${cardBg};
      border: 1px solid ${borderColor};
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #DAA520;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .title {
      font-family: 'Montserrat', sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #DAA520;
      margin: 16px 0 8px 0;
    }
    .badge {
      background: #DAA520;
      color: #05070c;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 11px;
    }
    .callout {
      background: ${isDark ? "#121927" : "#f1f5f9"};
      border-left: 4px solid #DAA520;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      border-bottom: 1px solid ${borderColor};
      text-align: left;
    }
    th {
      background: ${isDark ? "#0f172a" : "#e2e8f0"};
      color: ${textColor};
      font-size: 11px;
      text-transform: uppercase;
    }
    .total-box {
      background: ${isDark ? "#05070c" : "#fef3c7"};
      border: 1px solid #DAA520;
      padding: 20px;
      border-radius: 12px;
      margin-top: 24px;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div>
        <div style="font-family: 'Montserrat'; font-weight: 900; font-size: 24px; color: #DAA520;">GAG VISUAL</div>
        <div style="font-size: 11px; color: ${subTextColor};">${brand.tagline}</div>
      </div>
      <div>
        <span class="badge">${doc.type}</span>
      </div>
    </div>

    <h1 class="title">${doc.title}</h1>
    <p style="color: ${subTextColor}; font-size: 13px;">
      Cliente: <strong>${doc.clientName} (${doc.companyName})</strong> • Data: ${doc.date || new Date().toLocaleDateString("pt-PT")}
    </p>

    <div class="callout">
      <strong>Diagnóstico & Resumo Executivo:</strong><br/>
      ${doc.summary}
    </div>

    <div class="total-box">
      <div style="font-size: 12px; color: ${subTextColor};">Total Geral (Kwanzas)</div>
      <div style="font-size: 26px; font-weight: 900; color: #DAA520;">${formatAOA(fin.totalGross)}</div>
      <div style="margin-top: 8px; font-size: 13px; color: #f59e0b; font-weight: bold;">
        Sinal de 50% Obrigatório: ${formatAOA(fin.deposit50Percent)}
      </div>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid ${borderColor}; font-size: 11px; color: ${subTextColor}; text-align: center;">
      ${brand.corporateName} • Luanda, Angola • IBAN: ${doc.iban || brand.iban}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerFileDownload(blob, `${slugify(doc.title)}.html`);
}

/**
 * 5. EXPORT AS WHATSAPP TEXT (.txt & Direct Link)
 */
export function exportDocumentAsWhatsApp(doc: GagDocumentData, brand: GagBrandIdentity = GAG_BRAND_DEFAULTS): { text: string; waLink: string } {
  const fin = calculateDocumentFinancials(doc);

  const itemsText = (doc.items && doc.items.length > 0)
    ? doc.items.map((it, idx) => `• *${it.description}*: ${formatAOA(it.totalAOA)}`).join("\n")
    : `• *Projeto Executivo TOB*: ${formatAOA(fin.subtotal)}`;

  const text = `*GAG VISUAL — PROPOSTA EXECUTIVA* 👑
_Agência Criativa & Inteligência Multimodal (Luanda, Angola)_

Olá, *${doc.clientName}*!
Apresentamos a proposta formal para *${doc.companyName}*:

📌 *DOCUMENTO:* ${doc.title}
📅 *Data:* ${doc.date || new Date().toLocaleDateString("pt-PT")} (Válida por ${doc.validityDays || 15} dias)

📝 *RESUMO EXECUTIVO:*
${doc.summary}

💼 *ESCOPO & INVESTIMENTO:*
${itemsText}

💰 *VALOR GLOBAL:* *${formatAOA(fin.totalGross)}*
${doc.includeIVA ? `_(Inclui IVA 14% de ${formatAOA(fin.iva14)})_\n` : ""}
⚡ *CONDIÇÃO DE ADJUDICAÇÃO:*
• *Sinal de 50% para início dos trabalhos:* *${formatAOA(fin.deposit50Percent)}*
• *Saldo final de 50% na aprovação:* ${formatAOA(fin.balance50Percent)}

🏦 *DADOS BANCÁRIOS (LUANDA):*
• Banco: *${doc.bankName || brand.bankName}*
• IBAN: \`${doc.iban || brand.iban}\`
${brand.multicaixaEntity ? `• Multicaixa: Entidade *${brand.multicaixaEntity}* | Ref: *${brand.multicaixaRef || "987 654 321"}*\n` : ""}• Titular: *${brand.corporateName}*

Ficamos ao dispor para avançar imediatamente com a mobilização da equipa!
Assinado,
*${brand.managingDirector}*
Diretor Geral — GAG Visual
WhatsApp: ${brand.phone}`;

  const cleanPhone = (doc.clientPhone || "").replace(/\D/g, "");
  const waLink = cleanPhone.length >= 9
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  return { text, waLink };
}

/**
 * 6. EXPORT AS JSON
 */
export function exportDocumentAsJson(doc: GagDocumentData, brand: GagBrandIdentity = GAG_BRAND_DEFAULTS) {
  const fin = calculateDocumentFinancials(doc);
  const data = {
    schemaVersion: "gag-visual-v2.4",
    metadata: {
      generatedAt: new Date().toISOString(),
      generator: "KIA Executive Assistant",
      brand: brand.companyName,
      headquarters: brand.address,
      managingDirector: brand.managingDirector,
      contact: brand.phone,
      nif: doc.nif || brand.nif,
    },
    document: {
      id: doc.id || `doc-${Date.now()}`,
      title: doc.title,
      type: doc.type,
      date: doc.date || new Date().toLocaleDateString("pt-PT"),
      validityDays: doc.validityDays || 15,
      summary: doc.summary,
    },
    recipient: {
      clientName: doc.clientName,
      companyName: doc.companyName,
      phone: doc.clientPhone,
      email: doc.clientEmail,
    },
    financials: {
      currency: "AOA",
      subtotal: fin.subtotal,
      urgencyFee: fin.urgencyFee,
      iva14: fin.iva14,
      taxRetention6_5: fin.taxRetention6_5,
      totalGross: fin.totalGross,
      totalNet: fin.totalNet,
      deposit50Percent: fin.deposit50Percent,
      balance50Percent: fin.balance50Percent,
      formattedTotal: formatAOA(fin.totalGross),
      formattedDeposit: formatAOA(fin.deposit50Percent),
    },
    banking: {
      bankName: doc.bankName || brand.bankName,
      iban: doc.iban || brand.iban,
      accountHolder: brand.corporateName,
    },
    items: doc.items || [],
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  triggerFileDownload(blob, `${slugify(doc.title)}.json`);
}

/**
 * 7. EXPORT AS CSV (Financial & Scope Breakdown)
 */
export function exportDocumentAsCsv(doc: GagDocumentData, brand: GagBrandIdentity = GAG_BRAND_DEFAULTS) {
  const fin = calculateDocumentFinancials(doc);

  const rows = [
    ["GAG VISUAL CORE OS — EXTRATO EXECUTIVO DE DOCUMENTO"],
    ["Documento", doc.title],
    ["Tipo", doc.type],
    ["Cliente", doc.clientName],
    ["Empresa", doc.companyName],
    ["Telefone", doc.clientPhone || "N/A"],
    ["Data", doc.date || new Date().toLocaleDateString("pt-PT")],
    ["NIF", doc.nif || brand.nif],
    [],
    ["Item", "Descricao", "Quantidade", "Preco Unitario (AOA)", "Total (AOA)"],
  ];

  if (doc.items && doc.items.length > 0) {
    doc.items.forEach((it, idx) => {
      rows.push([
        String(idx + 1),
        `"${it.description.replace(/"/g, '""')}"`,
        String(it.quantity || 1),
        String(it.unitPriceAOA),
        String(it.totalAOA),
      ]);
    });
  } else {
    rows.push(["1", `"Projeto Estrategico Multimodal"`, "1", String(fin.subtotal), String(fin.subtotal)]);
  }

  rows.push([]);
  rows.push(["RESUMO FINANCEIRO", "", "", "", "VALOR (AOA)"]);
  rows.push(["Subtotal", "", "", "", String(fin.subtotal)]);
  if (doc.urgency48h) rows.push(["Taxa Urgencia 48h (+50%)", "", "", "", String(fin.urgencyFee)]);
  if (doc.includeIVA) rows.push(["IVA (14%)", "", "", "", String(fin.iva14)]);
  if (doc.includeTaxRetention) rows.push(["Retencao na Fonte (6,5%)", "", "", "", `-${fin.taxRetention6_5}`]);
  rows.push(["TOTAL GLOBAL", "", "", "", String(fin.totalGross)]);
  rows.push(["SINAL OBRIGATORIO (50%)", "", "", "", String(fin.deposit50Percent)]);
  rows.push(["SALDO NA ENTREGA (50%)", "", "", "", String(fin.balance50Percent)]);
  rows.push([]);
  rows.push(["Coordenadas Bancarias", `${doc.bankName || brand.bankName} — IBAN: ${doc.iban || brand.iban}`]);

  const csvContent = "\ufeff" + rows.map((r) => r.join(";")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  triggerFileDownload(blob, `${slugify(doc.title)}.csv`);
}

function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "documento_gag_visual";
}
