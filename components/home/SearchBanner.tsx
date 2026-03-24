'use client';
import { MapPin, Calendar, RefreshCw, Bus, Plane, Train, Car } from 'lucide-react';
import { useState } from 'react';
import { searchTrips, Trip } from '../../services/tripService';

type SwaggerLeg = {
  origin?: string;
  destination?: string;
  departure?: string;
  arrival?: string | null;
  trip_id?: string;
};

type SwaggerTrip = {
  type?: string;
  legs?: SwaggerLeg[];
  total_price?: number;
};

type PlaceOption = {
  id: number;
  name: string;
};

const PLACE_OPTIONS: PlaceOption[] = [
  { id: 1, name: 'Bạc Liêu' },
  { id: 2, name: 'Sài Gòn' },
  { id: 3, name: 'Cần Thơ' },
  { id: 4, name: 'An Giang' },
  { id: 5, name: 'Đồng Tháp' },
  { id: 6, name: 'Kiên Giang' },
  { id: 7, name: 'Sóc Trăng' },
  { id: 8, name: 'Cà Mau' },
  { id: 9, name: 'Vĩnh Long' },
  { id: 10, name: 'Tiền Giang' },
  { id: 11, name: 'Bến Tre' },
  { id: 12, name: 'Hậu Giang' },
];

export default function SearchBanner() {
  const [activeTab, setActiveTab] = useState('bus');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originId, setOriginId] = useState<number | null>(null);
  const [destinationId, setDestinationId] = useState<number | null>(null);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Trip[] | null>(null);

  function getErrorMessage(err: unknown): string {
    if (!err) return 'Không thể tìm chuyến. Vui lòng thử lại.';
    if (err instanceof Error && err.message.trim()) return err.message;
    if (typeof err === 'string' && err.trim()) return err;
    return 'Không thể tìm chuyến. Vui lòng thử lại.';
  }

  function pickText(obj: Record<string, unknown>, keys: string[], fallback = '-'): string {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'string' && value.trim()) return value;
      if (typeof value === 'number') return String(value);
    }
    return fallback;
  }

  function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
      const value = obj[key];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) return Number(value);
    }
    return null;
  }

  function normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  function mapSwaggerTripToUi(item: SwaggerTrip): Trip {
    const firstLeg = Array.isArray(item.legs) && item.legs.length > 0 ? item.legs[0] : undefined;
    return {
      busCompanyName: firstLeg?.trip_id || item.type || 'Nhà xe',
      originName: firstLeg?.origin,
      destinationName: firstLeg?.destination,
      departureTime: firstLeg?.departure,
      arrivalTime: firstLeg?.arrival || '-',
      price: typeof item.total_price === 'number' ? item.total_price : '-',
      availableSeats: '-',
    };
  }

  function normalizeTripsResponse(payload: unknown): Trip[] {
    if (Array.isArray(payload)) {
      if (payload.length > 0 && typeof payload[0] === 'object' && payload[0] !== null && 'legs' in (payload[0] as Record<string, unknown>)) {
        return (payload as SwaggerTrip[]).map(mapSwaggerTripToUi);
      }
      return payload as Trip[];
    }

    if (payload && typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;

      // Swagger response can be a single trip object.
      if (Array.isArray(obj.legs)) {
        return [mapSwaggerTripToUi(obj as unknown as SwaggerTrip)];
      }

      if (Array.isArray(obj.content)) return obj.content as Trip[];

      if (obj.data && typeof obj.data === 'object') {
        const data = obj.data as Record<string, unknown>;
        if (Array.isArray(data.content)) return data.content as Trip[];
      }
    }

    return [];
  }

  const tabs = [
    { id: 'bus', label: 'Xe khách', icon: <Bus size={20} /> },
    { id: 'plane', label: 'Máy bay', icon: <Plane size={20} /> },
    { id: 'train', label: 'Tàu hỏa', icon: <Train size={20} /> },
    { id: 'rental', label: 'Thuê xe', icon: <Car size={20} /> },
  ];

  const filteredOriginPlaces = PLACE_OPTIONS.filter((item) => normalizeText(item.name).includes(normalizeText(origin))).slice(0, 8);
  const filteredDestinationPlaces = PLACE_OPTIONS.filter((item) => normalizeText(item.name).includes(normalizeText(destination))).slice(0, 8);

  function handleSelectOrigin(option: PlaceOption) {
    setOrigin(option.name);
    setOriginId(option.id);
    setShowOriginDropdown(false);
  }

  function handleSelectDestination(option: PlaceOption) {
    setDestination(option.name);
    setDestinationId(option.id);
    setShowDestinationDropdown(false);
  }

  async function handleSearch() {
    setError(null);
    setResults(null);
    setLoading(true);
    try {
      if (!origin.trim() || !destination.trim()) {
        throw new Error('Vui lòng nhập Nơi xuất phát và Nơi đến.');
      }
      const params: Record<string, unknown> = {};
      if (originId && destinationId) {
        params.origin_id = originId;
        params.destination_id = destinationId;
      } else {
        params.origin = origin;
        params.destination = destination;
      }
      if (date) params.date = date;
      const res = await searchTrips(params);
      setResults(normalizeTripsResponse(res));
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSwapRoute() {
    setOrigin(destination);
    setDestination(origin);
    setOriginId(destinationId);
    setDestinationId(originId);
  }

  return (
    <div className="relative w-full pt-20 pb-16 flex flex-col items-center overflow-visible px-10 bg-[center_top] bg-no-repeat bg-[#2474E5] bg-[url('https://static.vexere.com/production/banners/1209/leaderboard_1440x480-(2).jpg')] bg-[length:100%_auto]">
      <div className="z-10 text-center mb-8 mt-4 h-24" />

      <div className="z-10 w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-visible">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-4 text-center font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="text-xl">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 flex flex-col xl:flex-row items-center gap-3 relative overflow-visible">
          <div className="flex-1 flex flex-col md:flex-row w-full border border-gray-200 rounded-lg hover:border-blue-500 transition relative overflow-visible">
            <div className="flex-1 flex items-center p-3 cursor-text hover:bg-blue-50/50 relative">
              <MapPin className="text-blue-500 mr-2" size={24} />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-500 font-medium">Nơi xuất phát</span>
                <input
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    setOriginId(null);
                    setShowOriginDropdown(true);
                  }}
                  onFocus={() => setShowOriginDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOriginDropdown(false), 120)}
                  type="text"
                  placeholder="Nhập tỉnh/thành"
                  className="font-semibold outline-none text-lg w-full bg-transparent text-gray-800"
                />
              </div>

              {showOriginDropdown && filteredOriginPlaces.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                  {filteredOriginPlaces.map((item) => (
                    <button
                      key={`origin-${item.id}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectOrigin(item)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Đổi nơi đi và nơi đến"
              title="Đổi nơi đi và nơi đến"
              onClick={handleSwapRoute}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 p-2 rounded-full border border-gray-200 shadow-sm transition"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>

            <div className="flex-1 flex items-center p-3 border-t md:border-t-0 md:border-l border-gray-200 cursor-text hover:bg-blue-50/50 md:pl-8 relative">
              <MapPin className="text-red-500 mr-2" size={24} />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-500 font-medium">Nơi đến</span>
                <input
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setDestinationId(null);
                    setShowDestinationDropdown(true);
                  }}
                  onFocus={() => setShowDestinationDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 120)}
                  type="text"
                  placeholder="Nhập tỉnh/thành"
                  className="font-semibold outline-none text-lg w-full bg-transparent text-gray-800"
                />
              </div>

              {showDestinationDropdown && filteredDestinationPlaces.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                  {filteredDestinationPlaces.map((item) => (
                    <button
                      key={`destination-${item.id}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectDestination(item)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full xl:w-auto mt-2 xl:mt-0 gap-3">
            <div className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition min-w-[200px] hover:bg-blue-50/50">
              <Calendar className="text-blue-500 mr-2" size={24} />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Ngày đi</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Ngày đi"
                  title="Ngày đi"
                  className="font-semibold text-lg text-gray-800 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition min-w-[160px] hover:bg-blue-50/50">
              <span className="text-blue-500 font-semibold text-lg">+ Thêm ngày về</span>
            </div>
          </div>

          <button onClick={handleSearch} disabled={loading} className="w-full xl:w-auto bg-[#FFD333] hover:bg-yellow-400 text-[#2474E5] font-bold text-lg py-4 px-10 rounded-lg mt-2 xl:mt-0 transition transform hover:scale-[1.02] shadow-md xl:whitespace-nowrap">
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-10 text-white font-medium text-sm">
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">✓</span> Chắc chắn có chỗ</div>
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">🎧</span> Hỗ trợ 24/7</div>
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">🎫</span> Nhiều ưu đãi</div>
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">💲</span> Thanh toán đa dạng</div>
      </div>

      {/* Results area */}
      <div className="z-10 w-full max-w-5xl mt-8 px-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        {results && results.length === 0 && <div className="bg-white p-4 rounded shadow">Không tìm thấy chuyến phù hợp.</div>}
        {results && results.length > 0 && (
          <div className="space-y-4">
            {results.map((t, i) => (
              <div key={i} className="bg-white p-4 rounded shadow flex justify-between items-center">
                {(() => {
                  const row = t as Record<string, unknown>;
                  const busCompanyName = pickText(row, ['busCompanyName', 'bus_company_name', 'operatorName', 'operator_name'], 'Nhà xe');
                  const originName = pickText(row, ['originName', 'origin_name', 'fromName', 'from_name']);
                  const destinationName = pickText(row, ['destinationName', 'destination_name', 'toName', 'to_name']);
                  const departureTime = pickText(row, ['departureTime', 'departure_time', 'departAt', 'depart_at']);
                  const arrivalTime = pickText(row, ['arrivalTime', 'arrival_time', 'arriveAt', 'arrive_at']);
                  const seats = pickText(row, ['availableSeats', 'available_seats', 'seatsAvailable', 'seats_available']);
                  const priceNumber = pickNumber(row, ['price', 'ticketPrice', 'ticket_price', 'fare']);
                  const priceText = priceNumber !== null ? `${priceNumber.toLocaleString()}đ` : pickText(row, ['price', 'ticketPrice', 'ticket_price', 'fare']);

                  return (
                    <>
                      <div>
                        <div className="font-bold text-gray-800">{busCompanyName}</div>
                        <div className="text-sm text-gray-600">{originName} → {destinationName}</div>
                        <div className="text-sm text-gray-600">{departureTime} — {arrivalTime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{priceText}</div>
                        <div className="text-sm text-gray-600">Còn {seats} chỗ</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
