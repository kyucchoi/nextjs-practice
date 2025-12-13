'use client';

import Logout from '@/components/Logout';
import dynamic from 'next/dynamic';
import SkeletonLoading from '@/components/loading/SkeletonLoading';
import SpinnerLoading from '@/components/loading/SpinnerLoading';
import { useABTest } from '@/lib/hooks/useABTest';

const DashboardDndKit = dynamic(() => import('@/components/DashboardDndKit'), {
  ssr: false,
  loading: () => <LoadingVariant />,
});

function LoadingVariant() {
  const variant = useABTest({
    testName: 'loading-screen',
    variants: ['spinner', 'skeleton'],
  });

  if (!variant) return null;

  return variant === 'spinner' ? <SpinnerLoading /> : <SkeletonLoading />;
}

export default function Home() {
  return (
    <div className="mx-5">
      <Logout />
      <DashboardDndKit />
    </div>
  );
}
