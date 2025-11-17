'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';

interface ExchangeRate {
  currency: string;
  rate: string;
}

interface ExchangeRateResponse {
  rates: ExchangeRate[];
  executionTimeMs: number;
}

export default function ExchangeRateAxios() {
  const [selectedCountry, setSelectedCountry] = useState('');
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

  const selectedRate = data.rates.find((r) => r.currency === selectedCountry);

  return (
    <div>
      <div className="flex w-auto flex-col gap-4 rounded-b-lg border p-8 shadow-sm">
        <div>Axios</div>

        <Select
          onValueChange={setSelectedCountry}
          defaultValue={selectedCountry}
        >
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

        {selectedCountry && selectedRate && (
          <>
            {/* <h4>{selectedCountry}</h4> */}
            <p>1 {selectedCountry} =</p>
            <h2>{selectedRate.rate} KRW</h2>
          </>
        )}
      </div>
    </div>
  );
}
