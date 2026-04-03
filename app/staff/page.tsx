'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CalendarDays, Users, Settings, LogOut,
  QrCode, ScanLine, CheckCircle2, XCircle, Clock, Search,
  Bus, Phone, User, ChevronDown, RefreshCw, Loader2, MoreVertical
} from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import { tripService } from '@/services/tripService';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface TripItem {
  id: number;
  route_name?: string;
  bus_plate?: string;
  bus_type?: string;
  total_seats?: number;
  departure_time?: string;
  arrival_time?: string;
  actual_price?: number;
  status?: string;
}

interface Passenger {
  id: number;
  passenger_name: string;
  phone: string;
  seat_number: string;
  price: number;
  ticket_status: string;
  check_in_status: string;
}

type NavTab = 'dashboard' | 'schedule' | 'passengers' | 'settings';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  SCHEDULED: { label: 'Sắp khởi hành', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Đang chạy', color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
};

export default function StaffDashboard() {
  const router = useRouter();
  const { userProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Trips
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Passengers
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [passengersLoading, setPassengersLoading] = useState(false);
  const [paxSearch, setPaxSearch] = useState('');
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [paxToast, setPaxToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // QR check-in
  const [ticketId, setTicketId] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'ok' | 'already' | 'error'>('idle');
  const [scannedInfo, setScannedInfo] = useState<Passenger | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load trips
  useEffect(() => {
    tripService.getAllTrips()
      .then(data => {
        const list = Array.isArray(data) ? data as TripItem[] : [];
        setTrips(list);
        if (list.length > 0) setSelectedTrip(list[0]);
      })
      .catch(console.error)
      .finally(() => setTripsLoading(false));
  }, []);

  // Load passengers when trip changes
  const loadPassengers = useCallback(async (tripId: number) => {
    setPassengersLoading(true);
    try {
      const data = await tripService.getPassengers(String(tripId));
      setPassengers(Array.isArray(data) ? data : []);
    } catch { setPassengers([]); }
    finally { setPassengersLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedTrip) loadPassengers(selectedTrip.id);
  }, [selectedTrip, loadPassengers]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!paxToast) return;
    const t = setTimeout(() => setPaxToast(null), 2500);
    return () => clearTimeout(t);
  }, [paxToast]);

  const handleStatusChange = async (status: string) => {
    if (!selectedTrip) return;
    setStatusUpdating(true);
    try {
      await tripService.updateTripStatus(selectedTrip.id, status);
      const updated = { ...selectedTrip, status };
      setSelectedTrip(updated);
      setTrips(prev => prev.map(t => t.id === selectedTrip.id ? updated : t));
    } catch { /* ignore */ }
    finally { setStatusUpdating(false); }
  };

  const handleCheckIn = async (p: Passenger) => {
    setCheckingIn(p.id);
    try {
      await ticketService.checkIn(p.id);
      setPassengers(prev => prev.map(x => x.id === p.id ? { ...x, check_in_status: 'ON_BOARD' } : x));
      setPaxToast({ msg: `Check-in: ${p.passenger_name} – Ghế ${p.seat_number}`, ok: true });
    } catch {
      setPaxToast({ msg: 'Check-in thất bại', ok: false });
    } finally { setCheckingIn(null); }
  };

  const handleScan = async (id: string) => {
    if (!id.trim()) return;
    setScanLoading(true); setScanStatus('idle'); setScannedInfo(null);
    try {
      const res = await ticketService.checkIn(id);
      setScannedInfo(res);
      setScanStatus(res.check_in_status === 'ON_BOARD' ? 'ok' : 'already');
      // Also update the local passenger list
      setPassengers(prev => prev.map(p => p.id === res.id ? { ...p, check_in_status: 'ON_BOARD' } : p));
    } catch (err: unknown) {
      const msg = ((err as { response?: { data?: { message?: unknown } } })?.response?.data?.message || '') as string;
      setScanStatus(msg.toLowerCase().includes('already') ? 'already' : 'error');
    } finally {
      setScanLoading(false); setTicketId('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const filteredPax = passengers.filter(p =>
    (p.passenger_name || '').toLowerCase().includes(paxSearch.toLowerCase()) ||
    (p.phone || '').includes(paxSearch) ||
    (p.seat_number || '').toLowerCase().includes(paxSearch.toLowerCase())
  );
  const onBoard = passengers.filter(p => p.check_in_status === 'ON_BOARD').length;
  const pending = passengers.filter(p => p.check_in_status !== 'ON_BOARD' && p.ticket_status === 'ACTIVE').length;

  const navItems: { id: NavTab; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Trang chủ' },
    { id: 'schedule', icon: <CalendarDays size={20} />, label: 'Lịch trình' },
    { id: 'passengers', icon: <Users size={20} />, label: 'Hành khách' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Cài đặt' },
  ];

  const tripStatus = selectedTrip?.status || 'SCHEDULED';
  const statusCfg = STATUS_CONFIG[tripStatus] || STATUS_CONFIG.SCHEDULED;

  return (
    <div className="flex min-h-screen w-full bg-[#f5f6fa]">
      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shadow-sm flex-shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-5 border-b border-gray-100">
          <div className="w-7 h-7 bg-[#1a2456] rounded-lg flex items-center justify-center">
            <Bus size={14} className="text-white" />
          </div>
          <span className="font-bold text-[#1a2456] text-sm tracking-tight">Vexere Staff</span>
        </div>

        {/* Profile */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-base uppercase">
              {userProfile?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-gray-800 text-sm truncate">{userProfile?.full_name || 'Staff'}</div>
              <div className="text-xs text-gray-400">ID: {userProfile?.id || '---'} · {userProfile?.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id
                ? 'bg-[#1a2456] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => { logout(); router.replace('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toast */}
        {paxToast && (
          <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-bold ${paxToast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {paxToast.ok ? '✅ ' : '❌ '}{paxToast.msg}
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto space-y-5">

          {/* ── TRIP HEADER ── */}
          {tripsLoading ? (
            <div className="flex items-center gap-3 text-gray-400 py-4">
              <Loader2 className="animate-spin" size={20} /> Đang tải chuyến...
            </div>
          ) : selectedTrip ? (
            <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    ACTIVE
                  </span>
                  {/* Trip selector dropdown */}
                  <div className="relative">
                    <select
                      className="text-xl font-black text-[#1a2456] bg-transparent outline-none cursor-pointer appearance-none pr-6"
                      value={selectedTrip.id}
                      onChange={e => {
                        const t = trips.find(x => x.id === Number(e.target.value));
                        if (t) setSelectedTrip(t);
                      }}
                    >
                      {trips.map(t => (
                        <option key={t.id} value={t.id}>{t.route_name || `Chuyen #${t.id}`}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Mã chuyến: <span className="font-bold text-[#1a2456]">#{selectedTrip.id}</span></span>
                  {selectedTrip.departure_time && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{new Date(selectedTrip.departure_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-gray-300">•</span>
                      <span>{new Date(selectedTrip.departure_time).toLocaleDateString('vi-VN')}</span>
                    </>
                  )}
                </div>
              </div>
              {/* Status changer */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trang thai chuyen</span>
                <div className="relative">
                  <select
                    className={`appearance-none pl-4 pr-9 py-2.5 rounded-xl border text-sm font-bold outline-none cursor-pointer ${statusCfg.bg} ${statusCfg.color} shadow-sm`}
                    value={tripStatus}
                    onChange={e => handleStatusChange(e.target.value)}
                    disabled={statusUpdating}
                  >
                    <option value="SCHEDULED">Sắp khởi hành</option>
                    <option value="IN_PROGRESS">Đang chạy</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                  <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${statusCfg.color}`} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl px-6 py-6 text-center text-gray-400 shadow-sm border">Không có chuyến nào</div>
          )}

          {/* ── MAIN CONTENT: QR left, Passengers right ── */}
          {selectedTrip && (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">

              {/* ── QR SCANNER PANEL ── */}
              <div className="w-full lg:w-[340px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* QR viewport */}
                <div className="bg-[#0f1833] flex-1 flex flex-col items-center justify-center p-6 min-h-[280px] relative">
                  {/* Corner brackets */}
                  <div className="relative w-48 h-48">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#4d6cfa] rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#4d6cfa] rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#4d6cfa] rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#4d6cfa] rounded-br-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {scanLoading ? (
                        <Loader2 size={40} className="text-[#4d6cfa] animate-spin" />
                      ) : scanStatus === 'ok' ? (
                        <CheckCircle2 size={48} className="text-green-400" />
                      ) : scanStatus === 'error' ? (
                        <XCircle size={48} className="text-red-400" />
                      ) : (
                        <QrCode size={40} className="text-[#4d6cfa]/60" />
                      )}
                    </div>
                    {/* Scan line animation */}
                    {scanLoading && (
                      <div className="absolute left-2 right-2 h-0.5 bg-[#4d6cfa] animate-bounce" style={{ top: '50%' }} />
                    )}
                  </div>
                  <p className="text-white/40 text-sm mt-4">
                    {scanStatus === 'idle' ? 'Đưa mã QR vào khung hình' :
                      scanStatus === 'ok' ? 'Soát vé thành công' :
                        scanStatus === 'already' ? 'Vé đã được soát' :
                          scanStatus === 'error' ? 'Vé không hợp lệ' : 'Đang xử lý...'}
                  </p>
                </div>

                {/* Scan result info */}
                {scannedInfo && (scanStatus === 'ok' || scanStatus === 'already') && (
                  <div className={`px-4 py-3 text-xs border-t ${scanStatus === 'ok' ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'}`}>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hành khách:</span>
                      <span className="font-bold">{scannedInfo.passenger_name}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">Số ghế:</span>
                      <span className="font-bold text-blue-600">{scannedInfo.seat_number}</span>
                    </div>
                  </div>
                )}

                {/* Manual button */}
                <div className="p-4 border-t border-gray-100">
                  {showManualInput ? (
                    <form onSubmit={e => { e.preventDefault(); handleScan(ticketId); }} className="flex gap-2">
                      <input
                        ref={inputRef}
                        autoFocus
                        value={ticketId}
                        onChange={e => setTicketId(e.target.value)}
                        placeholder="Nhap ma ve..."
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                      />
                      <button type="submit" disabled={!ticketId.trim() || scanLoading}
                        className="px-3 py-2 bg-[#1a2456] text-white text-xs font-bold rounded-lg disabled:opacity-50">
                        OK
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => { setShowManualInput(true); setScanStatus('idle'); setScannedInfo(null); }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a2456] hover:bg-[#253070] text-white text-sm font-bold rounded-xl transition"
                    >
                      <ScanLine size={18} /> Soát vé thủ công
                    </button>
                  )}
                </div>
              </div>

              {/* ── PASSENGER LIST ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                {/* Passenger table header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-500" />
                    <span className="font-bold text-gray-800">
                      Danh sách hành khách ({passengersLoading ? '...' : `${passengers.length}/${selectedTrip.total_seats || '?'}`})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm tên, số ghế.."
                        className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400 w-44"
                        value={paxSearch}
                        onChange={e => setPaxSearch(e.target.value)}
                      />
                    </div>
                    <button onClick={() => loadPassengers(selectedTrip.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                      <RefreshCw size={15} className={passengersLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto min-h-[280px]">
                  {passengersLoading ? (
                    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                      <Loader2 className="animate-spin" size={24} /> Đang tải...
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm">
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-5 py-3 text-left w-16">Ghế</th>
                          <th className="px-5 py-3 text-left">Hành khách</th>
                          <th className="px-5 py-3 text-left hidden md:table-cell">Điểm đón</th>
                          <th className="px-5 py-3 text-left">Trạng thái</th>
                          <th className="px-5 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredPax.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">Không có hành khách</td></tr>
                        ) : filteredPax.map(p => (
                          <tr key={p.id} className={`hover:bg-gray-50/70 transition-colors ${p.check_in_status === 'ON_BOARD' ? 'bg-green-50/40' : ''}`}>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md font-bold text-sm">
                                {p.seat_number}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-gray-800">{p.passenger_name || 'Khach le'}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Phone size={10} />
                                {p.phone ? p.phone.replace(/(\d{3})(\d{4})(\d{3})/, '$1xxxx$3') : 'N/A'}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 hidden md:table-cell text-gray-500 text-xs">—</td>
                            <td className="px-5 py-3.5">
                              {p.check_in_status === 'ON_BOARD' ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
                                  <CheckCircle2 size={13} /> Đã lên xe
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                  <Clock size={13} /> Chưa lên xe
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {p.check_in_status === 'ON_BOARD' ? (
                                <button className="p-1.5 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition">
                                  <MoreVertical size={16} />
                                </button>
                              ) : p.ticket_status === 'ACTIVE' ? (
                                <button
                                  onClick={() => handleCheckIn(p)}
                                  disabled={checkingIn === p.id}
                                  className="px-3 py-1.5 bg-[#1a2456] hover:bg-[#253070] text-white text-xs font-bold rounded-lg transition disabled:opacity-60 flex items-center gap-1.5 ml-auto"
                                >
                                  {checkingIn === p.id ? <Loader2 size={12} className="animate-spin" /> : <ScanLine size={12} />}
                                  Soát vé
                                </button>
                              ) : (
                                <span className="text-xs text-red-400 font-medium">Vé hủy</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Show more */}
                {passengers.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100 text-center">
                    <button className="text-sm font-semibold text-[#1a2456] hover:underline">
                      Xem toàn bộ danh sách ({passengers.length} khách) ↓
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STATS BOTTOM ── */}
          {selectedTrip && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'HÀNH KHÁCH',
                  value: `${passengers.length}/${selectedTrip.total_seats || '?'}`,
                  icon: <Users size={22} className="text-blue-400" />,
                  color: 'text-gray-800'
                },
                {
                  label: 'ĐÃ CHECK-IN',
                  value: onBoard,
                  icon: <CheckCircle2 size={22} className="text-green-500" />,
                  color: 'text-green-600'
                },
                {
                  label: 'CÒN LẠI',
                  value: pending,
                  icon: <Clock size={22} className="text-orange-400" />,
                  color: 'text-orange-500'
                },
                {
                  label: 'TRANG THÁI XE',
                  value: selectedTrip.bus_type || 'Sẵn sàng',
                  icon: <Bus size={22} className="text-blue-500" />,
                  color: 'text-blue-600'
                },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule tab */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Lịch trình các chuyến</h2>
              <div className="space-y-3">
                {trips.map(t => {
                  const cfg = STATUS_CONFIG[t.status || 'SCHEDULED'] || STATUS_CONFIG.SCHEDULED;
                  return (
                    <div key={t.id} onClick={() => { setSelectedTrip(t); setActiveTab('dashboard'); }}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                      <div>
                        <div className="font-bold text-gray-800">{t.route_name || `Chuyen #${t.id}`}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {t.bus_plate} • {t.departure_time ? new Date(t.departure_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
