import ExchangeRateAxios from '@/components/ExchangeRateAxios';
import ExchangeRateRQ from '@/components/ExchangeRateRQ';

export default function Home() {
  return (
    <div className="m-5">
      <ExchangeRateAxios />
      <ExchangeRateRQ />
    </div>
  );
}
