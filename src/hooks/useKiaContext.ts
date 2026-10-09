import { useState, useCallback } from 'react';

export const useKiaContext = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughtProcess, setThoughtProcess] = useState<string[]>([]);

  const getContextAwareResponse = useCallback(async (userInput: string) => {
    setIsProcessing(true);
    setThoughtProcess(['A analisar entrada...', 'A pesquisar base de conhecimento...', 'A sintetizar contexto...']);

    try {
      // 1. Pesquisa semântica
      const searchRes = await fetch('/api/search/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userInput }),
      });
      const { results } = await searchRes.json();
      
      setThoughtProcess(prev => [...prev, `Documentos encontrados: ${results.length}`]);

      // 2. Aqui, a lógica de injeção no KIA chat seria chamada
      // Retornando o contexto para o componente
      return results;
    } catch (err) {
      setThoughtProcess(prev => [...prev, 'Erro ao recuperar contexto.']);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { getContextAwareResponse, isProcessing, thoughtProcess };
};
