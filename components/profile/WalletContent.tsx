'use client';
import { useEffect, useState } from 'react';
import { walletService } from '../../services/walletService';

export default function WalletContent() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions()
      ]);
      setBalance(walletRes.balance);
      setTransactions(txRes);
    } catch (error) {
      console.error('Failed to fetch wallet info', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 10000) {
      alert('Vui lòng nhập số tiền nạp hợp lệ (tối thiểu 10,000 VND)');
      return;
    }
    try {
      setIsDepositing(true);
      const res = await walletService.deposit(amount);
      if (res && res.payment_url) {
        window.location.href = res.payment_url;
      }
    } catch (error: any) {
      console.error('Deposit error', error);
      alert(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch nạp tiền');
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ví của tôi</h2>
      
      {loading ? (
        <div className="text-center py-10">Đang tải thông tin ví...</div>
      ) : (
        <>
          {/* Số dư và Nạp tiền */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Số dư hiện tại</p>
              <h3 className="text-3xl font-bold text-[#2474E5]">
                {balance?.toLocaleString('vi-VN')} đ
              </h3>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="number"
                placeholder="Số tiền cần nạp..."
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5]"
              />
              <button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg transition whitespace-nowrap disabled:opacity-50"
              >
                {isDepositing ? 'Đang xử lý...' : 'Nạp tiền'}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 p-4 rounded-lg mb-8">
            <span className="font-bold">Ưu đãi nạp thẻ:</span>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Nạp từ <span className="font-bold">500.000đ</span>: Tặng thêm 15%</li>
              <li>Nạp từ <span className="font-bold">1.000.000đ</span>: Tặng thêm 18%</li>
            </ul>
          </div>

          {/* Lịch sử giao dịch */}
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lịch sử giao dịch</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-sm">
                  <th className="py-3 px-4 font-semibold text-gray-700">Mã giao dịch</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Ngày giao dịch</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Loại</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">Số tiền</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-center">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {tx.reference}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded inline-block ${
                          tx.type === 'DEPOSIT' ? 'bg-blue-100 text-blue-700' : 
                          tx.type === 'PAYMENT' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {tx.type === 'DEPOSIT' ? 'NẠP TỀN' : tx.type === 'PAYMENT' ? 'THANH TOÁN' : tx.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${
                        tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount?.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded inline-block ${
                          tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                          tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-[200px]" title={tx.description}>
                        {tx.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
