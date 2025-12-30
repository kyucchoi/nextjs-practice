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
import { getAllExchangeRatesWithAxios } from '@/lib/api/exchange';

export default function ExchangeRateARQ() {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrencyARQ') || '';
    }
    return '';
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchange-rates-axios'],
    queryFn: getAllExchangeRatesWithAxios,
    retry: 1,
  });

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    localStorage.setItem('selectedCurrencyARQ', value);
  };

  if (isLoading) return <WidgetBox>로딩 중...</WidgetBox>;
  if (isError) return <WidgetBox>에러 발생!</WidgetBox>;
  if (!data) return <WidgetBox>데이터가 없습니다.</WidgetBox>;

  const selectedRate = data.rates.find((r) => r.currency === selectedCurrency);

  return (
    <WidgetBox className="p-8">
      <div>axios + react-query</div>

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
