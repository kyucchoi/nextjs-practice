import { useEffect, useState, useRef } from 'react';

interface ABTestOptions {
  testName: string;
  variants: string[];
}

export function useABTest({ testName, variants }: ABTestOptions) {
  const [variant, setVariant] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasSentRef = useRef<boolean>(false);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const savedVariant = localStorage.getItem(`ab-${testName}`);

    if (savedVariant && variants.includes(savedVariant)) {
      setVariant(savedVariant);
    } else {
      const randomIndex = Math.floor(Math.random() * variants.length);
      const randomVariant = variants[randomIndex];
      setVariant(randomVariant);
      localStorage.setItem(`ab-${testName}`, randomVariant);
    }
  }, [testName, variants]);

  useEffect(() => {
    return () => {
      if (hasSentRef.current || !variant) return;

      const stayTime = Date.now() - startTimeRef.current;
      hasSentRef.current = true;
      sendAnalytics(variant, stayTime);
    };
  }, [variant]);

  return variant;
}

async function sendAnalytics(type: string, stayTime: number) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) return;

    const url = `${API_URL}/api/v1/analytics/ui-test`;
    const body = JSON.stringify({ type, stayTime });
    const headers = { 'Content-Type': 'application/json' };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}
