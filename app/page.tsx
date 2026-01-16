'use client';

import Logout from '@/components/Logout';
import WidgetAddButton from '@/components/WidgetAddButton';
import dynamic from 'next/dynamic';
import SkeletonLoading from '@/components/ui/loading/SkeletonLoading';
import SpinnerLoading from '@/components/ui/loading/SpinnerLoading';
import { useABTest } from '@/lib/hooks/useABTest';
import VoteBanner from '@/components/VoteBanner';
import { useEffect } from 'react';
import { DashboardProvider } from '@/contexts/DashboardContext';

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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <DashboardProvider>
      <div className="py-5">
        <div className="flex justify-between items-center mb-4">
          <WidgetAddButton />
          <Logout />
        </div>
        <VoteBanner />
        <DashboardDndKit />
      </div>
    </DashboardProvider>
  );
}
