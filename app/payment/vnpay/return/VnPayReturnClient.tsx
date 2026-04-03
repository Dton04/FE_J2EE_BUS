'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VnPayReturnClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [seconds, setSeconds] = useState(2);

  const status = params.get('status');
  const txnRef = params.get('txnRef');

  const isSuccess = useMemo(() => status === 'success', [status]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (seconds !== 0) return;
    const qs = new URLSearchParams();
    qs.set('payment', isSuccess ? 'success' : 'failed');
    if (txnRef) qs.set('txnRef', txnRef);
    router.replace(`/profile/orders?${qs.toString()}`);
  }, [seconds, isSuccess, txnRef, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 bg-white shadow-sm ${
          isSuccess ? 'border-green-100' : 'border-red-100'
        }`}
      >
        <div className={`text-xl font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
          {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {isSuccess ? 'Hệ thống đã ghi nhận thanh toán của bạn.' : 'Giao dịch không thành công hoặc đã bị huỷ.'}
        </div>
        {txnRef && (
          <div className="mt-3 text-xs text-gray-500">
            Mã giao dịch: <span className="font-semibold text-gray-700">{txnRef}</span>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link href="/profile/orders" className="text-[#2474E5] hover:underline font-bold text-sm">
            Xem đơn hàng ngay
          </Link>
          <div className="text-sm text-gray-500 font-medium">
            Tự chuyển hướng sau <span className="font-bold text-gray-700">{seconds}</span>s
          </div>
        </div>
      </div>
    </div>
  );
}
