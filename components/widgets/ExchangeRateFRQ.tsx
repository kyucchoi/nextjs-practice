'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WidgetBox } from '@/components/ui/widget-box';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ExchangeRate {
  currency: string;
  rate: string;
}

interface ExchangeRateResponse {
  rates: ExchangeRate[];
  executionTimeMs: number;
}

export default function ExchangeRateFRQ() {
  // localStorage에서 초기값 가져오기
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrencyFRQ') || '';
    }
    return '';
  });

  const { data, isLoading, isError } = useQuery<ExchangeRateResponse>({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/exchange/rate/all/async`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            },
          }
        );
        if (response.status === 403) {
          throw new Error('인증이 만료되었습니다. 토큰을 갱신해주세요.');
        }
        if (!response.ok) {
          throw new Error('환율 데이터를 가져오는데 실패했습니다');
        }
        return response.json();
      } catch (error) {
        toast('환율 정보를 불러오는데 실패했습니다.', {
          icon: (
            <i
              className="fa-solid fa-xmark"
              style={{ color: 'var(--red)', fontSize: '20px' }}
            ></i>
          ),
          style: {
            background: 'var(--white)',
            color: 'var(--black)',
            border: '1px solid var(--red)',
          },
        });
        throw error;
      }
    },
  });

  // 통화 선택 변경 시 localStorage에 저장
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    localStorage.setItem('selectedCurrencyFRQ', value);
  };

  if (isLoading) return <WidgetBox>로딩 중...</WidgetBox>;
  if (isError) return <WidgetBox>에러 발생!</WidgetBox>;
  if (!data) return <WidgetBox>데이터가 없습니다.</WidgetBox>;

  const selectedRate = data.rates.find((r) => r.currency === selectedCurrency);

  return (
    <WidgetBox className="p-8">
      <div>fetch + react-query</div>

      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="나라를 선택해주세요" />
        </SelectTrigger>
        <SelectContent>
          {data.rates.map((rate) => (
            <SelectItem key={rate.currency} value={rate.currency}>
              {rate.currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCurrency && selectedRate && (
        <>
          <div>1 {selectedCurrency} =</div>
          <div>{selectedRate.rate} KRW</div>
        </>
      )}
    </WidgetBox>
  );
}
