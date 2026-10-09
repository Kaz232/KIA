import { useState, useEffect } from 'react';

export const useOmniRouteStatus = () => {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const start = Date.now();
      try {
        // Assume health check endpoint exists on the gateway
        const res = await fetch('https://gagomni.onrender.com/api/omniroute/health');
        if (res.ok) {
          setStatus('online');
          setLatency(Date.now() - start);
        } else {
          setStatus('offline');
          setLatency(null);
        }
      } catch (err) {
        setStatus('offline');
        setLatency(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Poll a cada 15s
    return () => clearInterval(interval);
  }, []);

  return { status, latency };
};
