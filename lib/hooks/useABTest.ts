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
    // 로딩 시작 시간 기록
    startTimeRef.current = Date.now();

    // 지금은 localStorage 방식
    const savedVariant = localStorage.getItem(`ab-${testName}`);

    if (savedVariant && variants.includes(savedVariant)) {
      setVariant(savedVariant);
    } else {
      // 랜덤 분배
      const randomIndex = Math.floor(Math.random() * variants.length);
      const randomVariant = variants[randomIndex];
      setVariant(randomVariant);
      localStorage.setItem(`ab-${testName}`, randomVariant);
    }
  }, [testName, variants]);

  useEffect(() => {
    // 컴포넌트 언마운트 시 체류 시간 전송
    return () => {
      if (hasSentRef.current || !variant) return;

      const stayTime = Date.now() - startTimeRef.current;
      hasSentRef.current = true;
      sendAnalytics(variant, stayTime);
    };
  }, [variant]);

  return variant;
}

// 분석 데이터 전송
async function sendAnalytics(type: string, stayTime: number) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) return;

    const url = `${API_URL}/api/v1/analytics/ui-test`;
    const body = JSON.stringify({ type, stayTime });
    const headers = { 'Content-Type': 'application/json' };

    if (navigator.sendBeacon) {
      // sendBeacon은 안정적인 데이터 전송을 보장합니다.
      // Blob을 사용하여 Content-Type을 명시적으로 지정합니다.
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    } else {
      // 구형 브라우저를 위한 fallback
      await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include', // 쿠키를 포함하여 인증 정보를 전송합니다.
        body,
        keepalive: true, // fetch에서도 요청 유지를 시도합니다.
      });
    }
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
}
