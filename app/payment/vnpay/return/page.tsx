import { Suspense } from 'react';
import VnPayReturnClient from './VnPayReturnClient';

export default function VnPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 p-6 bg-white shadow-sm text-gray-500 font-medium text-center">
            Đang xử lý thanh toán...
          </div>
        </div>
      }
    >
      <VnPayReturnClient />
    </Suspense>
  );
}
