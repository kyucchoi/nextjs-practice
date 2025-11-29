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

// GraphQL 응답 데이터 타입
interface ExchangeRate {
  currency: string;
  rate: string;
}

interface GraphQLResponse {
  data: {
    specificExchangeRates: {
      rates: ExchangeRate[];
      executionTimeMs: number;
    };
  };
}

// 요청할 통화 목록 (필요한 통화만 선택적으로 요청)
const CURRENCIES = ['USD', 'JPY', 'EUR', 'CNY', 'GBP'];

export default function ExchangeRateGraphQL() {
  // localStorage에서 초기값 가져오기
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrency') || '';
    }
    return '';
  });
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 통화 선택 시에만 데이터 fetch
  useEffect(() => {
    if (!selectedCurrency) return; // 선택 안 했으면 실행 안 함

    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // GraphQL 쿼리 정의 (특정 통화만 요청)
        const GRAPHQL_QUERY = `
          query GetRates($currencyCodes: [String!]!) {
            specificExchangeRates(currencyCodes: $currencyCodes) {
              rates {
                currency
                rate
              }
              executionTimeMs
            }
          }
        `;

        // GraphQL 엔드포인트로 POST 요청
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
            },
            // 쿼리와 변수를 JSON으로 전송
            body: JSON.stringify({
              query: GRAPHQL_QUERY,
              variables: {
                currencyCodes: CURRENCIES, // 요청할 통화 목록 전달
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error('GraphQL 요청 실패');
        }

        // 응답 데이터에서 환율 정보 추출
        const result: GraphQLResponse = await response.json();
        setRates(result.data.specificExchangeRates.rates);
        setLastUpdated(new Date()); // 업데이트 시간 저장
      } catch (error) {
        console.error('Error fetching rates:', error);
        setIsError(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [selectedCurrency]); // selectedCurrency 변경 시에만 실행

  // 통화 선택 변경 시 localStorage에 저장
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    localStorage.setItem('selectedCurrency', value);
  };

  // 업데이트 시간 포맷 (예: "2024.11.29 15:30")
  const formatUpdateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 선택된 통화의 환율 정보 찾기
  const selectedRate = rates.find((r) => r.currency === selectedCurrency);

  return (
    <WidgetBox>
      {/* 통화 선택 드롭다운 */}
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="통화를 선택해주세요" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[167px] mt-4">
          <p className="text-gray-400 text-lg">로딩 중...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-[167px] mt-4">
          <p className="text-gray-400 text-sm">에러 발생!</p>
        </div>
      ) : selectedCurrency && selectedRate ? (
        /* 환율 정보 표시 */
        <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-lg p-6 border border-gray-100 mt-4">
          {/* 환율 메인 정보 */}
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600 mb-2">
              1 {selectedCurrency}
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold">
                {Number(selectedRate.rate).toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-gray-600">KRW</span>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* 마지막 업데이트 시간 */}
          {lastUpdated && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <i className="fa-regular fa-clock"></i>
              <span>마지막 업데이트: {formatUpdateTime(lastUpdated)}</span>
            </div>
          )}
        </div>
      ) : (
        /* 초기 상태 */
        <div className="flex items-center justify-center h-[167px] mt-4">
          <p className="text-gray-400 text-lg">환율이 궁금하세요?</p>
        </div>
      )}
    </WidgetBox>
  );
}
