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
    const url = `/api/proxy?path=/api/v1/analytics/ui-test`;
    const body = JSON.stringify({ type, stayTime });

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}
