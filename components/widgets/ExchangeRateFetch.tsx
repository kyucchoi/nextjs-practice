'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WidgetBox } from '@/components/ui/widget-box';
import { toast } from 'sonner';
import {
  getAllExchangeRatesWithFetch,
  ExchangeRateResponse,
} from '@/lib/api/exchange';

export default function ExchangeRateFetch() {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrencyFetch') || '';
    }
    return '';
  });
  const [data, setData] = useState<ExchangeRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const result = await getAllExchangeRatesWithFetch();
        setData(result);
      } catch (error) {
        console.error('환율 데이터 가져오기 실패:', error);
        setIsError(true);
        toast('환율 정보를 불러오는데 실패했습니다.', {
          icon: (
            <i
              className="fa-solid fa-xmark"
              style={{ color: 'var(--css-red)', fontSize: '20px' }}
            ></i>
          ),
          style: {
            background: 'var(--css-white)',
            color: 'var(--css-black)',
            border: '1px solid var(--css-red)',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    localStorage.setItem('selectedCurrencyFetch', value);
  };

  if (isLoading) return <WidgetBox>로딩 중...</WidgetBox>;
  if (isError) return <WidgetBox>에러 발생!</WidgetBox>;
  if (!data) return <WidgetBox>데이터가 없습니다.</WidgetBox>;

  const selectedRate = data.rates.find((r) => r.currency === selectedCurrency);

  return (
    <WidgetBox className="p-8">
      <div>fetch</div>

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
