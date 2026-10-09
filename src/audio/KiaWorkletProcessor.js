
class KiaWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.threshold = 0.05; // VAD Threshold
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channel = input[0];
      let sum = 0;
      for (let i = 0; i < channel.length; i++) sum += channel[i] * channel[i];
      const rms = Math.sqrt(sum / channel.length);
      const isSpeaking = rms > this.threshold;
      
      // Enviar métricas para o Dashboard
      this.port.postMessage({ type: 'metrics', rms, isSpeaking });
      
      if (isSpeaking) {
        const pcm16 = new Int16Array(channel.length);
        for (let i = 0; i < channel.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, channel[i])) * 0x7FFF;
        }
        this.port.postMessage({ type: 'audio', data: pcm16.buffer }, [pcm16.buffer]);
      }
    }
    return true;
  }
}

registerProcessor('kia-worklet-processor', KiaWorkletProcessor);
