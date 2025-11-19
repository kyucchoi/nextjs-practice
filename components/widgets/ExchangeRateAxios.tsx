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
import axios from 'axios';
import { widgetDataStore } from '@/store/widgetDataStore';

interface ExchangeRate {
  currency: string;
  rate: string;
}

interface ExchangeRateResponse {
  rates: ExchangeRate[];
  executionTimeMs: number;
}

export default function ExchangeRateAxios() {
  const { selectedCurrency, setSelectedCurrency } = widgetDataStore();
  const [data, setData] = useState<ExchangeRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/exchange/rate/all/async`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            },
          }
        );
        setData(response.data);
      } catch (error) {
        console.error('환율 데이터 가져오기 실패:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  if (isLoading) return <p>로딩 중...</p>;
  if (isError) return <p>에러 발생!</p>;
  if (!data) return <p>데이터가 없습니다.</p>;

  const selectedRate = data.rates.find((r) => r.currency === selectedCurrency);

  return (
    <div>
      <WidgetBox className="p-8">
        <div>Axios</div>

        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
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
            <p>1 {selectedCurrency} =</p>
            <h2>{selectedRate.rate} KRW</h2>
          </>
        )}
      </WidgetBox>
    </div>
  );
}
