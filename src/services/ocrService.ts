import Tesseract from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 100
  stage: 'initializing' | 'loading' | 'recognizing' | 'completed' | 'error';
}

export interface OcrResult {
  text: string;
  confidence: number;
  success: boolean;
  error?: string;
  isOcr: boolean;
  fileName: string;
}

export interface OcrOptions {
  lang?: string;
  onProgress?: (progress: OcrProgress) => void;
}

/**
 * Maps raw Tesseract status to a friendly Portuguese description
 */
function mapTesseractStatus(status: string, progressRatio: number): { label: string; stage: OcrProgress['stage'] } {
  const percent = Math.round(progressRatio * 100);
  switch (status) {
    case 'loading tesseract core':
      return { label: `A inicializar motor OCR (${percent}%)...`, stage: 'initializing' };
    case 'loading language traineddata':
      return { label: `A carregar dicionário linguístico (${percent}%)...`, stage: 'loading' };
    case 'initializing api':
      return { label: `A calibrar reconhecimento óptico...`, stage: 'initializing' };
    case 'recognizing text':
      return { label: `A ler e extrair texto da imagem (${percent}%)...`, stage: 'recognizing' };
    default:
      return { label: `A processar documento (${percent}%)...`, stage: 'recognizing' };
  }
}

/**
 * Cleans and standardizes raw OCR text
 */
export function sanitizeOcrText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    // Remove excessive consecutive blank lines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove weird control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Performs OCR on an image file, blob, or URL using Tesseract.js
 */
export async function performOcr(
  imageSource: File | Blob | string,
  fileName: string = 'documento-anexo.png',
  options: OcrOptions = {}
): Promise<OcrResult> {
  const primaryLang = options.lang || 'por';
  const onProgress = options.onProgress;

  try {
    onProgress?.({
      status: 'A iniciar leitura óptica (OCR)...',
      progress: 5,
      stage: 'initializing',
    });

    let ocrResponse;
    try {
      ocrResponse = await Tesseract.recognize(imageSource, primaryLang, {
        logger: (m) => {
          if (onProgress && m) {
            const mapped = mapTesseractStatus(m.status || '', m.progress || 0);
            onProgress({
              status: mapped.label,
              progress: Math.min(99, Math.round((m.progress || 0) * 100)),
              stage: mapped.stage,
            });
          }
        },
      });
    } catch (langErr) {
      console.warn(`[OCR] Falha no pacote de língua '${primaryLang}', tentando fallback para 'eng':`, langErr);
      // Fallback to English if Portuguese dataset fails to download or load
      ocrResponse = await Tesseract.recognize(imageSource, 'eng', {
        logger: (m) => {
          if (onProgress && m) {
            const mapped = mapTesseractStatus(m.status || '', m.progress || 0);
            onProgress({
              status: mapped.label,
              progress: Math.min(99, Math.round((m.progress || 0) * 100)),
              stage: mapped.stage,
            });
          }
        },
      });
    }

    const rawText = ocrResponse?.data?.text || '';
    const confidence = ocrResponse?.data?.confidence || 0;
    const cleanText = sanitizeOcrText(rawText);

    onProgress?.({
      status: 'Extração OCR concluída com sucesso!',
      progress: 100,
      stage: 'completed',
    });

    return {
      text: cleanText,
      confidence: Math.round(confidence),
      success: true,
      isOcr: true,
      fileName,
    };
  } catch (err: any) {
    console.error('[OCR Service Error]:', err);
    onProgress?.({
      status: `Erro no processamento OCR: ${err?.message || 'Falha ao analisar imagem'}`,
      progress: 0,
      stage: 'error',
    });

    return {
      text: '',
      confidence: 0,
      success: false,
      error: err?.message || 'Falha desconhecida no leitor OCR',
      isOcr: true,
      fileName,
    };
  }
}

/**
 * Extracts text from an attached file. If it's an image, runs Tesseract OCR.
 * If it's a plain text file, reads content directly.
 */
export async function extractTextFromFile(
  file: File,
  options: OcrOptions = {}
): Promise<OcrResult> {
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|tiff)$/i.test(file.name);
  const isPlainText =
    file.type.startsWith('text/') ||
    /\.(txt|csv|json|md|log|xml|html|js|ts|tsx|jsx)$/i.test(file.name);

  if (isImage) {
    return performOcr(file, file.name, options);
  }

  if (isPlainText) {
    options.onProgress?.({
      status: `A ler conteúdo do ficheiro de texto ${file.name}...`,
      progress: 50,
      stage: 'recognizing',
    });

    try {
      const text = await file.text();
      const clean = sanitizeOcrText(text);
      options.onProgress?.({
        status: 'Ficheiro de texto carregado!',
        progress: 100,
        stage: 'completed',
      });
      return {
        text: clean,
        confidence: 100,
        success: true,
        isOcr: false,
        fileName: file.name,
      };
    } catch (err: any) {
      return {
        text: '',
        confidence: 0,
        success: false,
        error: `Erro ao ler ficheiro de texto: ${err?.message}`,
        isOcr: false,
        fileName: file.name,
      };
    }
  }

  // Unsupported or complex format (e.g. binary PDF)
  return {
    text: '',
    confidence: 0,
    success: false,
    error: `Formato de ficheiro não suporta extração direta de texto. Envie uma imagem (PNG, JPG) ou documento de texto.`,
    isOcr: false,
    fileName: file.name,
  };
}

/**
 * Formats extracted OCR or file text for direct insertion into the KIA chat input field
 */
export function formatOcrForChatInput(
  existingInput: string,
  fileName: string,
  extractedText: string
): string {
  const trimmed = existingInput.trim();
  const cleanExtracted = extractedText.trim();
  if (!cleanExtracted) return existingInput;

  const header = `[Texto extraído via OCR de ${fileName}]:`;
  const block = `${header}\n${cleanExtracted}`;

  if (!trimmed) {
    return block;
  }

  // Check if we are appending to existing input
  return `${trimmed}\n\n${block}`;
}
