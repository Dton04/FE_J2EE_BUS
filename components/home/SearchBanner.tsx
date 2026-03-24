'use client';
import { useRouter } from 'next/navigation';
import { MapPin, RefreshCw, Bus, Plane, Train, Car, Calendar, X, BadgeCheck, Headphones, Tag, CircleDollarSign } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import DatePicker from './DatePicker';

const tabs = [
  { id: 'bus', label: 'Xe khách', icon: <Bus size={18} />, badge: '' },
  { id: 'plane', label: 'Máy bay', icon: <Plane size={18} />, badge: '-30k' },
  { id: 'train', label: 'Tàu hỏa', icon: <Train size={18} />, badge: '-25k' },
  { id: 'rental', label: 'Thuê xe', icon: <Car size={18} />, badge: 'Mới' },
];

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDate(d: Date) {
  return `${DAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function SearchBanner() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bus');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const today = new Date();
  const defaultDepart = new Date(today);
  defaultDepart.setDate(today.getDate() + 1);

  const [departDate, setDepartDate] = useState<Date | null>(defaultDepart);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'depart' | 'return'>('depart');



  const dateRowRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const openPicker = (mode: 'depart' | 'return') => {
    // Measure the position of the date buttons row for portal positioning
    if (dateRowRef.current) {
      const r = dateRowRef.current.getBoundingClientRect();
      setAnchorRect({ top: r.bottom, left: r.left, width: r.width });
    }
    setPickerMode(mode);
    setPickerOpen(true);
  };

  // Close picker when user scrolls (picker is fixed-position, would float out of place)
  useEffect(() => {
    if (!pickerOpen) return;
    const handleScroll = () => setPickerOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pickerOpen]);

  const swap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  return (
    <div
      className="relative w-full flex flex-col items-center px-4 py-10"
      style={{
        backgroundImage: 'url("https://static.vexere.com/production/banners/1209/leaderboard_1440x480-(2).jpg")',
        backgroundSize: '100% auto',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#2474E5',
      }}
    >
      {/* Spacer for hero image text */}
      <div className="h-20 mb-4" />

      {/* Search Card */}
      <div className="z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold transition relative ${
                activeTab === tab.id
                  ? 'text-[#2474E5] border-b-2 border-[#2474E5]'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab.badge === 'Mới' ? 'bg-green-500' : 'bg-[#2474E5]'} text-white`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <div className="p-4 relative">
          <div className="flex flex-col xl:flex-row items-stretch gap-2">

            {/* Route Inputs */}
            <div className="flex flex-1 items-stretch border border-gray-200 rounded-xl overflow-hidden hover:border-[#2474E5] transition relative">
              {/* From */}
              <div className="flex-1 flex items-center gap-2 px-4 py-3 cursor-text hover:bg-blue-50/40 transition">
                <div className="w-5 h-5 rounded-full bg-[#2474E5] flex items-center justify-center flex-none">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Nơi xuất phát</span>
                  <input
                    type="text"
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    placeholder="Chọn điểm đi"
                    className="font-semibold text-gray-900 outline-none bg-transparent text-sm w-full placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Divider + Swap */}
              <div className="relative flex items-center">
                <div className="w-px h-8 bg-gray-200" />
                <button
                  onClick={swap}
                  className="absolute left-1/2 -translate-x-1/2 z-10 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-50 shadow-sm transition"
                >
                  <RefreshCw size={14} className="text-gray-500" />
                </button>
              </div>

              {/* To */}
              <div className="flex-1 flex items-center gap-2 px-4 py-3 cursor-text hover:bg-blue-50/40 transition">
                <MapPin size={18} className="text-red-500 flex-none" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Nơi đến</span>
                  <input
                    type="text"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    placeholder="Chọn điểm đến"
                    className="font-semibold text-gray-900 outline-none bg-transparent text-sm w-full placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Date Inputs */}
            <div ref={dateRowRef} className="flex gap-2 xl:flex-none">
              {/* Depart Date */}
              <button
                onClick={() => openPicker('depart')}
                className={`flex items-center gap-2.5 px-4 py-3 border rounded-xl min-w-[170px] transition ${
                  pickerOpen && pickerMode === 'depart'
                    ? 'border-[#2474E5] bg-blue-50'
                    : 'border-gray-200 hover:border-[#2474E5] hover:bg-blue-50/40'
                }`}
              >
                <Calendar size={18} className="text-[#2474E5] flex-none" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Ngày đi</span>
                  <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {departDate ? formatDate(departDate) : 'Chọn ngày'}
                  </span>
                </div>
              </button>

              {/* Return Date */}
              <button
                onClick={() => openPicker('return')}
                className={`flex items-center gap-2.5 px-4 py-3 border rounded-xl min-w-[170px] transition relative ${
                  returnDate
                    ? pickerOpen && pickerMode === 'return'
                      ? 'border-[#2474E5] bg-blue-50'
                      : 'border-gray-200 hover:border-[#2474E5] hover:bg-blue-50/40'
                    : 'border-dashed border-gray-300 hover:border-[#2474E5]'
                }`}
              >
                <Calendar size={18} className={`flex-none ${returnDate ? 'text-[#2474E5]' : 'text-gray-400'}`} />
                <div className="flex flex-col items-start flex-1">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Ngày về</span>
                  <span className={`font-semibold text-sm whitespace-nowrap ${returnDate ? 'text-gray-900' : 'text-[#2474E5]'}`}>
                    {returnDate ? formatDate(returnDate) : '+ Thêm ngày về'}
                  </span>
                </div>
                {returnDate && (
                  <span
                    onClick={e => { e.stopPropagation(); setReturnDate(null); }}
                    className="ml-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={14} />
                  </span>
                )}
              </button>
            </div>

            {/* Search Button */}
            <button
              onClick={() => {
                const params = new URLSearchParams({
                  from,
                  to,
                  date: departDate ? departDate.toISOString().split('T')[0] : '',
                });
                if (returnDate) params.append('returnDate', returnDate.toISOString().split('T')[0]);
                router.push(`/search?${params.toString()}`);
              }}
              className="xl:flex-none bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold text-base py-3.5 px-8 rounded-xl transition hover:shadow-lg whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </div>

          {/* DatePicker — backdrop closes on outside click; picker itself is on top */}
          {pickerOpen && (
            <>
              {/* Invisible backdrop — clicking it closes the picker */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={() => setPickerOpen(false)}
              />
              <DatePicker
                departDate={departDate}
                returnDate={returnDate}
                onDepartChange={setDepartDate}
                onReturnChange={setReturnDate}
                onClose={() => setPickerOpen(false)}
                mode={pickerMode}
                anchorRect={anchorRect}
              />
            </>
          )}
        </div>
      </div>

      {/* Trust badges */}
      <div className="z-10 flex flex-wrap justify-center gap-x-12 gap-y-4 mt-10 pb-4">
        {[
          { icon: <BadgeCheck size={20} className="fill-[#FFD333] text-[#2474E5]" />, text: 'Chắc chắn có chỗ' },
          { icon: <Headphones size={20} className="text-[#FFD333]" />, text: 'Hỗ trợ 24/7' },
          { icon: <Tag size={20} className="text-[#FFD333] fill-[#FFD333]" />, text: 'Nhiều ưu đãi' },
          { icon: <CircleDollarSign size={20} className="text-[#FFD333] fill-[#FFD333]" />, text: 'Thanh toán đa dạng' },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-white font-bold text-[13px] lg:text-[14px]">
            {b.icon}
            {b.text}
          </div>
        ))}
      </div>
    </div>
  );
}
