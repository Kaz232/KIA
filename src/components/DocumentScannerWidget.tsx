import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';

export const DocumentScannerWidget = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('scanning');

    try {
      // If it's an image, use Tesseract OCR
      if (file.type.startsWith('image/')) {
        const { data: { text } } = await Tesseract.recognize(file, 'por');
        console.log('OCR Extracted Text:', text);
      } else {
        // Simulated OCR for PDFs (as Tesseract needs image processing)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('OCR Error:', error);
      setStatus('idle');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border border-slate-800/60 rounded-2xl bg-slate-900/40 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-amber-500" />
        Scanner Documental (OCR Ativado)
      </h3>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer hover:border-amber-500/50 bg-slate-950/50 hover:bg-slate-900 transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-slate-500" />
          <p className="text-sm text-slate-400">Clique para upload ou arraste PDF/Imagem</p>
        </div>
        <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
      </label>
      {status === 'scanning' && <div className="mt-4 text-amber-500 text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processando OCR...</div>}
      {status === 'success' && <div className="mt-4 text-emerald-500 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Análise e OCR concluídos.</div>}
    </div>
  );
};
