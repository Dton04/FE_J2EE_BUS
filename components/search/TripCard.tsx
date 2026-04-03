'use client';
import { useCallback, useMemo, useState, type SVGProps } from 'react';
import { Star, ShieldCheck, Tag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { tripService } from '../../services/tripService';
import { bookingService } from '../../services/bookingService';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { paymentService } from '../../services/paymentService';

interface TripProps {
  id: string;
  backendTripId?: number | string | null;
  searchType?: string;
  legs?: unknown[];
  image: string;
  operator: string;
  rating: number;
  reviews: number;
  type: string;
  departTime: string;
  departLocation: string;
  duration: string;
  arrivalTime: string;
  arrivalLocation: string;
  price: number;
  originalPrice?: number;
  discountNum?: number;
  availableSeats: number;
  badges: string[];
  promoText?: string;
}

type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';
type SeatMap = Record<string, SeatStatus>;

export default function TripCard({ trip }: { trip: TripProps }) {
  const router = useRouter();
  const { isAuthenticated, userProfile, setUserProfile } = useAuthStore();
  const [isLoadingStops, setIsLoadingStops] = useState(false);
  const [stopsData, setStopsData] = useState<unknown>(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSeatMapLoading, setIsSeatMapLoading] = useState(false);
  const [seatMapError, setSeatMapError] = useState<string | null>(null);
  const [seatMaps, setSeatMaps] = useState<Record<number, SeatMap>>({});
  const [activeLegTripId, setActiveLegTripId] = useState<number | null>(null);
  const [selectedSeatsByTripId, setSelectedSeatsByTripId] = useState<Record<number, string[]>>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + 'đ';
  const formatSeatCount = (value: number) => (value === 1 ? '1 ghế' : `${value} ghế`);

  const resolveNumericTripId = useCallback((): number | null => {
    const rawId = trip.backendTripId ?? trip.id;

    if (typeof rawId === 'number' && Number.isFinite(rawId) && rawId > 0) {
      return rawId;
    }

    if (typeof rawId === 'string') {
      const trimmed = rawId.trim();
      if (/^\d+$/.test(trimmed)) {
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      }
    }

    return null;
  }, [trip.backendTripId, trip.id]);

  const tripLegs = useMemo(() => {
    const legs = Array.isArray(trip.legs) ? trip.legs : [];
    const normalized = legs
      .map((leg) => {
        const record = (leg && typeof leg === 'object' ? leg : {}) as Record<string, unknown>;
        const tripIdValue = record.trip_id ?? record.tripId;
        const tripId =
          typeof tripIdValue === 'number'
            ? tripIdValue
            : typeof tripIdValue === 'string' && /^\d+$/.test(tripIdValue.trim())
              ? Number(tripIdValue)
              : null;

        return {
          tripId,
          origin: typeof record.origin === 'string' ? record.origin : '',
          destination: typeof record.destination === 'string' ? record.destination : '',
        };
      })
      .filter(
        (leg): leg is { tripId: number; origin: string; destination: string } =>
          typeof leg.tripId === 'number' && Number.isFinite(leg.tripId) && leg.tripId > 0
      );

    if (normalized.length) {
      return normalized;
    }

    const fallbackTripId = resolveNumericTripId();
    if (!fallbackTripId) return [];
    return [{ tripId: fallbackTripId, origin: trip.departLocation || '', destination: trip.arrivalLocation || '' }];
  }, [resolveNumericTripId, trip.legs, trip.departLocation, trip.arrivalLocation]);

  const handleFetchStops = async () => {
    if (stopsData) {
      setStopsData(null);
      return;
    }

    setIsLoadingStops(true);
    try {
      const tripId = resolveNumericTripId();
      if (!tripId) {
        setStopsData({ error: 'Không xác định được mã chuyến xe để lấy điểm dừng.' });
        return;
      }
      const data = await tripService.getStops(tripId);
      setStopsData(data || [{ time: trip.departTime, location: trip.departLocation }]);
    } catch (err) {
      console.error('Failed to fetch stops', err);
      setStopsData({ error: 'Không thể kết nối đến server để lấy điểm dừng.' });
    } finally {
      setIsLoadingStops(false);
    }
  };

  const normalizeSeatMap = (payload: unknown): SeatMap => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return {};
    }

    const map: SeatMap = {};
    for (const [seat, rawStatus] of Object.entries(payload as Record<string, unknown>)) {
      const status = typeof rawStatus === 'string' ? rawStatus.toUpperCase() : '';
      if (status === 'BOOKED' || status === 'HELD' || status === 'AVAILABLE') {
        map[seat] = status as SeatStatus;
      }
    }
    return map;
  };

  const sortSeats = (seats: string[]) => {
    const parse = (value: string) => {
      const trimmed = value.trim();
      const match = /^([A-Za-z]+)(\d+)$/.exec(trimmed);
      if (!match) return { prefix: trimmed, num: Number.POSITIVE_INFINITY, raw: trimmed };
      return { prefix: match[1].toUpperCase(), num: Number(match[2]), raw: trimmed };
    };
    return [...seats].sort((a, b) => {
      const pa = parse(a);
      const pb = parse(b);
      if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix);
      if (pa.num !== pb.num) return pa.num - pb.num;
      return pa.raw.localeCompare(pb.raw);
    });
  };

  const openSeatSelection = async () => {
    setStopsData(null);
    setSeatMapError(null);
    setSeatMaps({});
    setSelectedSeatsByTripId({});
    setActiveLegTripId(tripLegs.length ? tripLegs[0].tripId : null);
    setIsSeatModalOpen(true);
    setPassengerCount(1);

    let nextCustomerName =
      (typeof userProfile?.full_name === 'string' && userProfile.full_name.trim()) ||
      (typeof userProfile?.name === 'string' && userProfile.name.trim()) ||
      customerName ||
      '';

    let nextCustomerPhone =
      (typeof userProfile?.phone === 'string' && userProfile.phone.trim()) ||
      (typeof userProfile?.phone_number === 'string' && userProfile.phone_number.trim()) ||
      customerPhone ||
      '';

    if (isAuthenticated && (!nextCustomerName || !nextCustomerPhone)) {
      try {
        const profile = await authService.getProfile();
        setUserProfile(profile);
        nextCustomerName =
          (typeof profile?.full_name === 'string' && profile.full_name.trim()) ||
          (typeof profile?.name === 'string' && profile.name.trim()) ||
          nextCustomerName ||
          '';

        nextCustomerPhone =
          (typeof profile?.phone === 'string' && profile.phone.trim()) ||
          (typeof profile?.phone_number === 'string' && profile.phone_number.trim()) ||
          nextCustomerPhone ||
          '';
      } catch (err) {
        console.error('Failed to fetch profile before booking', err);
      }
    }

    setCustomerName(nextCustomerName);
    setCustomerPhone(nextCustomerPhone);

    const tripIds = tripLegs.map((leg) => leg.tripId);
    if (!tripIds.length) {
      setSeatMapError('Không xác định được mã chuyến xe để đặt vé.');
      return;
    }

    setIsSeatMapLoading(true);
    try {
      const results = await Promise.all(
        tripIds.map(async (tripId) => {
          const raw = await tripService.getSeatMap(tripId);
          return [tripId, normalizeSeatMap(raw)] as const;
        })
      );
      const mapped: Record<number, SeatMap> = {};
      for (const [tripId, map] of results) {
        mapped[tripId] = map;
      }
      setSeatMaps(mapped);
      setActiveLegTripId(tripIds[0]);
    } catch (err) {
      console.error('Failed to fetch seat map', err);
      setSeatMapError('Không thể kết nối đến server để lấy sơ đồ ghế.');
    } finally {
      setIsSeatMapLoading(false);
    }
  };

  const closeSeatSelection = () => {
    setIsSeatModalOpen(false);
    setSeatMapError(null);
    setSeatMaps({});
    setSelectedSeatsByTripId({});
    setActiveLegTripId(null);
  };

  const currentSeatMap = activeLegTripId ? seatMaps[activeLegTripId] : undefined;
  const seatNumbers = useMemo(() => {
    if (!currentSeatMap) return [];
    return sortSeats(Object.keys(currentSeatMap));
  }, [currentSeatMap]);

  const desiredSeatCount = useMemo(() => {
    const values = Object.values(selectedSeatsByTripId);
    if (!values.length) return 0;
    return Math.max(...values.map((arr) => arr.length));
  }, [selectedSeatsByTripId]);

  const toggleSeat = (seat: string) => {
    if (!activeLegTripId || !currentSeatMap) return;
    const status = currentSeatMap[seat];
    if (status !== 'AVAILABLE') return;

    setSelectedSeatsByTripId((prev) => {
      const existing = prev[activeLegTripId] ? [...prev[activeLegTripId]] : [];
      const index = existing.indexOf(seat);
      const next: Record<number, string[]> = { ...prev };

      if (index >= 0) {
        existing.splice(index, 1);
        next[activeLegTripId] = sortSeats(existing);
        return next;
      }

      const nextCount = existing.length + 1;
      const maxSeats = Math.max(1, Math.min(4, passengerCount));
      if (nextCount > maxSeats) {
        return prev;
      }

      existing.push(seat);
      next[activeLegTripId] = sortSeats(existing);

      return next;
    });
  };

  const handleBookTrip = async () => {
    await openSeatSelection();
  };

  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại để đặt chuyến.');
      return;
    }

    if (!tripLegs.length) {
      alert('Không xác định được chuyến xe để đặt vé.');
      return;
    }

    const requiredSeatsPerLeg = Math.max(1, Math.min(4, passengerCount));

    const legsPayload: Array<{ trip_id: number; seat_number: string }> = [];
    for (const leg of tripLegs) {
      const seats = selectedSeatsByTripId[leg.tripId] || [];
      if (seats.length !== requiredSeatsPerLeg) {
        alert(`Vui lòng chọn đúng ${formatSeatCount(requiredSeatsPerLeg)} cho tất cả các chặng.`);
        return;
      }
      for (const seat of seats) {
        legsPayload.push({ trip_id: leg.tripId, seat_number: seat });
      }
    }

    setIsBooking(true);
    try {
      const booking = await bookingService.createBooking({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        legs: legsPayload,
      });

      try {
        const payment = await paymentService.createPayment({
          booking_id: booking.id,
          payment_method: 'VNPAY',
        });
        // Redirect to gateway
        window.location.href = payment.payment_url;
        return;
      } catch (payErr: unknown) {
        console.error('Create payment failed', payErr);
        closeSeatSelection();
        alert('Không thể khởi tạo thanh toán. Vui lòng thử lại hoặc thanh toán tiền mặt tại quầy nếu được hỗ trợ.');
        if (isAuthenticated) {
          router.push('/profile/orders');
        }
        return;
      }
    } catch (error: unknown) {
      console.error('Failed to create booking', error);
      const apiMessage =
        typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Đặt chuyến thất bại. Vui lòng thử lại.';
      alert(apiMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const seatButtonClass = (seat: string) => {
    const status = currentSeatMap?.[seat];
    const isSelected = activeLegTripId ? (selectedSeatsByTripId[activeLegTripId] || []).includes(seat) : false;

    if (status === 'BOOKED') {
      return 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed';
    }
    if (status === 'HELD') {
      return 'bg-orange-100 text-orange-700 border-orange-200 cursor-not-allowed';
    }
    if (isSelected) {
      return 'bg-[#2474E5] text-white border-[#2474E5]';
    }
    return 'bg-white text-gray-900 border-gray-300 hover:border-[#2474E5] hover:text-[#2474E5]';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {trip.promoText && (
        <div className="bg-[#00A32A] text-white px-4 py-1.5 flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-1">
            <span>✨</span>
            <span>{trip.promoText}</span>
          </div>
          <span className="text-[13px] font-medium text-green-100">Số lượng có hạn!</span>
        </div>
      )}

      <div className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-[150px] h-[150px] flex-none rounded-lg overflow-hidden">
          <Image src={trip.image} alt={trip.operator} fill className="object-cover" />
          <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
            ✨ Xe Xịn ✨
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 border-b border-transparent">
              <h3 className="text-[17px] font-bold text-gray-900">{trip.operator}</h3>
              <div className="flex items-center gap-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                <Star size={12} fill="currentColor" />
                {trip.rating} <span className="font-medium text-blue-100">({trip.reviews})</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">{trip.type}</p>

            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#2474E5]" />
                <div className="w-px h-8 bg-gray-300 my-1 border-l border-dashed border-gray-400" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500" />
              </div>
              <div className="flex flex-col justify-between min-h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{trip.departTime}</span>
                  <span className="text-gray-600 text-sm">• {trip.departLocation}</span>
                </div>
                <div className="text-gray-400 text-sm">{trip.duration}</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{trip.arrivalTime}</span>
                  <span className="text-gray-600 text-sm">• {trip.arrivalLocation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-[200px] flex-none flex flex-col items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <div className="text-[#00A32A] text-[22px] font-bold leading-none mb-1">Từ {formatPrice(trip.price)}</div>
            {trip.originalPrice && (
              <div className="flex items-center justify-end gap-2 text-sm">
                <span className="line-through text-gray-400">{formatPrice(trip.originalPrice)}</span>
                {trip.discountNum && <span className="bg-red-100 text-red-600 font-bold px-1 rounded">-{trip.discountNum}%</span>}
              </div>
            )}
            <div className="flex items-center justify-end gap-1 mt-2 flex-wrap">
              {trip.badges.map((b, i) => (
                <span key={i} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                  <Tag size={10} /> {b}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 md:mt-0 text-right w-full">
            <div className="text-gray-600 text-sm mb-2 font-medium">Còn {trip.availableSeats} chỗ trống</div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleFetchStops}
                className="text-[#2474E5] text-sm font-medium hover:underline disabled:opacity-50"
                disabled={isLoadingStops}
              >
                {isLoadingStops ? 'Đang tải...' : 'Thông tin chi tiết'} <ChevronDown className="inline w-4 h-4" />
              </button>
              <button
                onClick={handleBookTrip}
                disabled={isBooking}
                className="bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {isBooking ? 'Đang đặt...' : 'Đặt chuyến'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#00A32A] mb-2 uppercase tracking-wide">
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Trả tận nơi</span>
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Theo dõi hành trình xe</span>
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Xác nhận tức thì</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#2474E5]">
          <span className="bg-[#2474E5] text-white text-[11px] font-bold px-2 py-0.5 rounded">Thông báo</span>
          <span className="hover:underline cursor-pointer">Tiện ích miễn phí - Hướng đi Cao tốc</span>
        </div>
      </div>

      {Boolean(stopsData) && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm">
          {Boolean(stopsData) && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Các điểm dừng (API /stops):</h4>
              <pre className="bg-white p-3 rounded border text-xs overflow-auto text-gray-700 max-h-40">
                {JSON.stringify(stopsData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {isSeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeSeatSelection} />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <div className="text-lg font-bold text-gray-900">Chọn ghế</div>
                <div className="text-sm text-gray-500">
                  {trip.departLocation} → {trip.arrivalLocation}
                </div>
              </div>
              <button
                type="button"
                onClick={closeSeatSelection}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="text-sm font-bold text-gray-900 mb-3">Thông tin hành khách</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Số vé</div>
                      <select
                        value={passengerCount}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setPassengerCount(next);
                          setSelectedSeatsByTripId({});
                          setSeatMapError(null);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5] bg-white"
                        title="Số vé"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Họ tên</div>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5]"
                        placeholder="Nhập họ tên"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Số điện thoại</div>
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2474E5] focus:ring-1 focus:ring-[#2474E5]"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-4">
                  <div className="text-sm font-bold text-gray-900 mb-3">Chặng</div>
                  <div className="space-y-2">
                    {tripLegs.map((leg, idx) => {
                      const isActive = activeLegTripId === leg.tripId;
                      const selected = selectedSeatsByTripId[leg.tripId] || [];
                      return (
                        <button
                          key={leg.tripId}
                          type="button"
                          onClick={() => setActiveLegTripId(leg.tripId)}
                          className={`w-full text-left rounded-lg px-3 py-2 border transition ${
                            isActive ? 'border-[#2474E5] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">
                              {idx + 1}. {leg.origin} → {leg.destination}
                            </div>
                            <div className="text-xs font-bold text-gray-600">
                              {selected.length ? formatSeatCount(selected.length) : 'Chưa chọn'}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">Mã chuyến: {leg.tripId}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-white border border-gray-300" />
                      <span className="text-gray-600">Trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-blue-600" />
                      <span className="text-gray-600">Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-orange-100 border border-orange-200" />
                      <span className="text-gray-600">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded bg-gray-200" />
                      <span className="text-gray-600">Đã bán</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-gray-900">Sơ đồ ghế</div>
                    <div className="text-xs text-gray-500">
                      {tripLegs.length > 1
                        ? `Chuyến nối: chọn ${formatSeatCount(Math.max(1, Math.min(4, passengerCount)))} mỗi chặng`
                        : `Chọn tối đa ${formatSeatCount(Math.max(1, Math.min(4, passengerCount)))}`}
                    </div>
                  </div>

                  {seatMapError && (
                    <div className="mb-4 bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
                      {seatMapError}
                    </div>
                  )}

                  {isSeatMapLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <div className="font-medium">Đang tải sơ đồ ghế...</div>
                    </div>
                  ) : !currentSeatMap ? (
                    <div className="py-16 text-center text-gray-500 font-medium">Chọn chặng để xem sơ đồ ghế.</div>
                  ) : seatNumbers.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 font-medium">Không có dữ liệu ghế cho chuyến này.</div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {seatNumbers.map((seat) => (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => toggleSeat(seat)}
                          className={`h-9 rounded-lg border text-xs font-bold transition ${seatButtonClass(seat)}`}
                          disabled={currentSeatMap[seat] !== 'AVAILABLE'}
                          title={`${seat} • ${currentSeatMap[seat]}`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-4 border-t pt-4">
                    <div className="text-sm text-gray-600">
                      {desiredSeatCount > 0 ? (
                        <span>
                          Đã chọn:{' '}
                          <span className="font-bold text-gray-900">
                            {Object.entries(selectedSeatsByTripId)
                              .flatMap(([tripId, seats]) => (seats || []).map((s) => `${tripId}:${s}`))
                              .join(', ')}
                          </span>
                        </span>
                      ) : (
                        <span>Chưa chọn ghế.</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={isBooking || isSeatMapLoading || !customerName.trim() || !customerPhone.trim()}
                      className="bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {isBooking ? 'Đang đặt...' : 'Tiếp tục đặt vé'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
