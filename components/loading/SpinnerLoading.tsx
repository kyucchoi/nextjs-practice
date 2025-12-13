import { Spinner } from '@/components/ui/spinner';

export default function SpinnerLoading() {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <Spinner className="h-12 w-12 mx-auto mb-4" />
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}
