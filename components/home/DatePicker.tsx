'use client';
import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

// Simplified lunar date conversion (approximation for display)
function getLunarDay(date: Date): string {
  const lunarOffset = Math.floor((date.getTime() - new Date(2026, 0, 1).getTime()) / 86400000) % 30;
  const lunar = ((lunarOffset + 14) % 30) + 1;
  return String(lunar);
}

interface DatePickerProps {
  departDate: Date | null;
  returnDate: Date | null;
  onDepartChange: (d: Date) => void;
  onReturnChange: (d: Date | null) => void;
  onClose: () => void;
  mode: 'depart' | 'return';
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function MonthGrid({
  year, month, today, departDate, returnDate, showLunar,
  onSelect, hoveredDate, onHover,
}: {
  year: number; month: number; today: Date;
  departDate: Date | null; returnDate: Date | null;
  showLunar: boolean; onSelect: (d: Date) => void;
  hoveredDate: Date | null; onHover: (d: Date | null) => void;
}) {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));

  const rangeEnd = returnDate || hoveredDate;

  return (
    <div className="flex-1 min-w-[260px]">
      <p className="text-center font-bold text-gray-900 text-base mb-4">
        {MONTHS[month]}, {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-semibold py-1 ${i >= 5 ? 'text-red-500' : 'text-gray-500'}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => {
          if (!date) return <div key={idx} />;
          const isToday    = isSameDay(date, today);
          const isDepart   = departDate && isSameDay(date, departDate);
          const isReturn   = returnDate && isSameDay(date, returnDate);
          const isHighlighted = isDepart || isReturn;
          const inRange    = departDate && rangeEnd
            && startOfDay(date) > startOfDay(departDate)
            && startOfDay(date) < startOfDay(rangeEnd);
          const isPast     = startOfDay(date) < startOfDay(today);
          const isSat      = date.getDay() === 6;
          const isSun      = date.getDay() === 0;
          const isRangeStart = isDepart && !!rangeEnd;
          const isRangeEnd   = isReturn || (hoveredDate && departDate && isSameDay(date, hoveredDate));

          return (
            <div
              key={idx}
              onClick={() => !isPast && onSelect(date)}
              onMouseEnter={() => !isPast && onHover(date)}
              onMouseLeave={() => onHover(null)}
              className={[
                'relative flex flex-col items-center justify-center h-[46px] select-none',
                isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:z-10',
                inRange ? 'bg-amber-100' : '',
                isRangeStart ? 'rounded-l-full' : '',
                isRangeEnd  ? 'rounded-r-full' : '',
              ].join(' ')}
            >
              <div className={[
                'w-9 h-9 flex flex-col items-center justify-center rounded-full text-sm font-semibold transition-colors',
                isHighlighted ? 'bg-[#FFD333] text-gray-900 shadow' : '',
                !isHighlighted && !isPast && (isSat || isSun) ? 'text-red-500' : '',
                !isHighlighted && !isPast && !(isSat || isSun) ? 'text-gray-900' : '',
                !isHighlighted && !isPast ? 'hover:bg-gray-100' : '',
                isToday && !isHighlighted ? 'text-[#2474E5] font-bold' : '',
              ].join(' ')}>
                <span className="leading-none">{date.getDate()}</span>
                {showLunar && (
                  <span className="text-[9px] font-normal leading-none mt-0.5 opacity-70">
                    {getLunarDay(date)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePicker({
  departDate, returnDate, onDepartChange, onReturnChange, onClose, mode,
}: DatePickerProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(() => {
    const base = departDate || today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [showLunar, setShowLunar] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<'depart' | 'return'>(mode);
  const nextMonth = {
    year:  viewMonth.month === 11 ? viewMonth.year + 1 : viewMonth.year,
    month: (viewMonth.month + 1) % 12,
  };

  const handlePrev = () => {
    const prev = viewMonth.month === 0
      ? { year: viewMonth.year - 1, month: 11 }
      : { year: viewMonth.year, month: viewMonth.month - 1 };
    if (prev.year > today.getFullYear() ||
       (prev.year === today.getFullYear() && prev.month >= today.getMonth())) {
      setViewMonth(prev);
    }
  };

  const handleSelect = useCallback((date: Date) => {
    if (selecting === 'depart') {
      onDepartChange(date);
      if (returnDate && date >= returnDate) onReturnChange(null);
      setSelecting('return');
    } else {
      if (departDate && date <= departDate) {
        onDepartChange(date);
        onReturnChange(null);
        setSelecting('return');
      } else {
        onReturnChange(date);
        onClose();
      }
    }
  }, [selecting, departDate, returnDate, onDepartChange, onReturnChange, onClose]);

  return (
    <div
      className="absolute left-1/2 top-[calc(100%+8px)] z-[9999] w-[620px] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl"
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Tab: departing / returning */}
      <div className="flex border-b border-gray-100">
        {(['depart', 'return'] as const).map(tab => {
          const isActive = selecting === tab;
          const date = tab === 'depart' ? departDate : returnDate;
          const label = date
            ? `${['CN','T2','T3','T4','T5','T6','T7'][date.getDay()]}, ${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`
            : (tab === 'depart' ? 'Chọn ngày đi' : 'Chọn ngày về (tuỳ chọn)');
          return (
            <button
              key={tab}
              onClick={() => setSelecting(tab)}
              className={`flex-1 py-3 text-sm font-semibold text-center transition border-b-2 ${isActive ? 'text-[#2474E5] border-[#2474E5]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Month navigation */}
      <div className="relative px-6 pt-5 pb-3">
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          title="Tháng trước"
          aria-label="Tháng trước"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 hover:bg-gray-100 rounded-full transition"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        {/* Two month grids */}
        <div className="flex gap-4">
          <MonthGrid
            {...viewMonth} today={today} departDate={departDate} returnDate={returnDate}
            showLunar={showLunar} onSelect={handleSelect} hoveredDate={hoveredDate} onHover={setHoveredDate}
          />
          <div className="w-px bg-gray-100 flex-none" />
          <MonthGrid
            {...nextMonth} today={today} departDate={departDate} returnDate={returnDate}
            showLunar={showLunar} onSelect={handleSelect} hoveredDate={hoveredDate} onHover={setHoveredDate}
          />
        </div>

        {/* Right arrow */}
        <button
          onClick={() => setViewMonth(nextMonth)}
          title="Tháng sau"
          aria-label="Tháng sau"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1.5 hover:bg-gray-100 rounded-full transition"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <button
          onClick={() => setShowLunar(v => !v)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          {showLunar
            ? <ToggleRight size={28} className="text-green-500" />
            : <ToggleLeft  size={28} className="text-gray-400" />}
          Hiển thị lịch âm
        </button>
        {returnDate && (
          <button
            onClick={() => { onReturnChange(null); setSelecting('return'); }}
            className="text-sm text-gray-400 hover:text-red-500 transition underline"
          >
            Xóa ngày về
          </button>
        )}
      </div>
    </div>
  );
}
