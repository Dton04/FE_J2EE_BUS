'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

const sortOptions = [
  { id: 'default', label: 'Mặc định' },
  { id: 'earliest', label: 'Giờ đi sớm nhất' },
  { id: 'latest', label: 'Giờ đi muộn nhất' },
  { id: 'highest_rating', label: 'Đánh giá cao nhất' },
  { id: 'lowest_price', label: 'Giá tăng dần' },
  { id: 'highest_price', label: 'Giá giảm dần' },
];

const busOperators = [
  { name: 'An Anh Limousine', count: 4, rating: 4.8 },
  { name: 'An Phú Buslines', count: 2, rating: 4.8 },
  { name: 'Bình Minh Tải', count: 20, rating: 4.7 },
  { name: 'Bốn Luyện Express', count: 1, rating: 4.0 },
  { name: 'Cúc Tùng', count: 78, rating: 3.9 },
  { name: 'Dũng Lệ', count: 1, rating: 4.1 },
];

const dropoffPoints = [
  { name: 'Cam Lâm', count: 1634 },
  { name: 'Cam Ranh', count: 1583 },
  { name: 'Nha Trang', count: 1359 },
  { name: 'Vạn Ninh', count: 900 },
  { name: 'Diên Khánh', count: 879 },
  { name: 'Ninh Hòa', count: 743 },
];

const vehicleTypes = [
  { name: 'Giường nằm', count: 47 },
  { name: 'Giường nằm có WC', count: 21 },
  { name: 'Limousine giường nằm', count: 109 },
  { name: 'Limousine giường nằm có WC', count: 45 },
  { name: 'Limousine giường phòng', count: 17 },
];

const seatTypes = [
  { name: 'Ghế ngồi', count: 2 },
  { name: 'Giường nằm', count: 482 },
  { name: 'Giường nằm đôi', count: 170 },
];

const ratings = [
  { stars: 5, label: 'trở lên', count: 594 },
  { stars: 4, label: 'trở lên', count: 654 },
];

export default function SearchSidebar() {
  // Keep these groups open by default to match screenshots
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Giờ đi', 'Nhà xe', 'Giá vé', 'Điểm trả']);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const isExpanded = (group: string) => expandedGroups.includes(group);

  return (
    <aside className="w-[300px] flex-none hidden lg:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Sắp xếp */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h3 className="font-bold text-gray-900 mb-4 text-[15px]">Sắp xếp</h3>
        <div className="flex flex-col gap-3">
          {sortOptions.map((opt, i) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                defaultChecked={i === 0}
                className="w-5 h-5 text-[#2474E5] border-gray-300 focus:ring-[#2474E5] cursor-pointer"
              />
              <span className="text-gray-700 text-[15px] group-hover:text-gray-900 transition">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Lọc */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-[15px]">Lọc</h3>
          <button className="text-[#2474E5] text-sm font-medium hover:underline">
            Xóa lọc
          </button>
        </div>

        <div className="flex flex-col">
          {/* Giờ đi */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Giờ đi')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Giờ đi</span>
              {isExpanded('Giờ đi') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Giờ đi') && (
              <div className="px-4 pb-6">
                {/* Visual Slider */}
                <div className="relative pt-6 pb-4">
                  <div className="h-1.5 w-full bg-[#2474E5] rounded-full relative">
                    <div className="absolute left-0 w-5 h-5 bg-[#E8F3FF] border-2 border-[#2474E5] rounded-full -top-1.5 -ml-1 cursor-pointer"></div>
                    <div className="absolute right-0 w-5 h-5 bg-[#E8F3FF] border-2 border-[#2474E5] rounded-full -top-1.5 -mr-1 cursor-pointer"></div>
                  </div>
                </div>
                {/* Time Inputs */}
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="border border-gray-300 rounded-lg px-3 py-1.5 flex-1">
                    <div className="text-gray-400 text-xs text-center">Từ</div>
                    <div className="font-semibold text-center text-[15px]">00:00</div>
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="border border-gray-300 rounded-lg px-3 py-1.5 flex-1">
                    <div className="text-gray-400 text-xs text-center">Đến</div>
                    <div className="font-semibold text-center text-[15px]">24:00</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nhà xe */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Nhà xe')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Nhà xe</span>
              {isExpanded('Nhà xe') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Nhà xe') && (
              <div className="px-4 pb-4">
                <input
                  type="text"
                  placeholder="Tìm trong danh sách"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#2474E5] mb-3"
                />
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {busOperators.map((operator, i) => (
                    <label key={i} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-700 text-[14px]">
                          {operator.name} <span className="text-gray-500">({operator.count})</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-700 text-[13px]">{operator.rating}</span>
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Giá vé */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Giá vé')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Giá vé</span>
              {isExpanded('Giá vé') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Giá vé') && (
              <div className="px-4 pb-6">
                <div className="relative pt-6 pb-2">
                  <div className="h-1.5 w-full bg-[#2474E5] rounded-full relative">
                    <div className="absolute left-0 w-5 h-5 bg-[#E8F3FF] border-2 border-[#2474E5] rounded-full -top-1.5 -ml-1 cursor-pointer"></div>
                    <div className="absolute right-0 w-5 h-5 bg-[#E8F3FF] border-2 border-[#2474E5] rounded-full -top-1.5 -mr-1 cursor-pointer"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-gray-500 text-[13px] mt-2">
                  <span>0 đ</span>
                  <span>2,000,000 đ</span>
                </div>
              </div>
            )}
          </div>

          {/* Điểm trả */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Điểm trả')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Điểm trả</span>
              {isExpanded('Điểm trả') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Điểm trả') && (
              <div className="px-4 pb-4">
                <input
                  type="text"
                  placeholder="Tìm trong danh sách"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#2474E5] mb-3"
                />
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {dropoffPoints.map((point, i) => (
                    <label key={i} className="flex items-center justify-start cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-700 text-[14px]">
                          {point.name} <span className="text-gray-500">({point.count})</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vị trí ghế */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Vị trí ghế')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Vị trí ghế</span>
              {isExpanded('Vị trí ghế') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Vị trí ghế') && (
              <div className="px-4 pb-4 flex flex-col gap-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 text-[15px]">Số ghế trống</span>
                  <div className="flex items-center gap-4">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 cursor-not-allowed">
                      -
                    </button>
                    <span className="font-bold text-[15px]">1</span>
                    <button className="w-8 h-8 rounded-full border border-[#2474E5] flex items-center justify-center text-[#2474E5] hover:bg-[#E8F3FF]">
                      +
                    </button>
                  </div>
                </div>
                <label className="flex items-center justify-between cursor-pointer group border-t border-gray-100 pt-3">
                  <span className="text-gray-700 text-[14px]">Hàng ghế đầu</span>
                  <input type="checkbox" className="w-5 h-5 text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer" />
                </label>
                <label className="flex items-center justify-between cursor-pointer group border-t border-gray-100 pt-3">
                  <span className="text-gray-700 text-[14px]">Hàng ghế giữa</span>
                  <input type="checkbox" className="w-5 h-5 text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer" />
                </label>
                <label className="flex items-center justify-between cursor-pointer group border-t border-gray-100 pt-3">
                  <span className="text-gray-700 text-[14px]">Hàng ghế cuối</span>
                  <input type="checkbox" className="w-5 h-5 text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer" />
                </label>
              </div>
            )}
          </div>

          {/* Loại xe */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Loại xe')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Loại xe</span>
              {isExpanded('Loại xe') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Loại xe') && (
              <div className="px-4 pb-4">
                <input
                  type="text"
                  placeholder="Tìm trong danh sách"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#2474E5] mb-3"
                />
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {vehicleTypes.map((type, i) => (
                    <label key={i} className="flex items-center justify-start cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer"
                        />
                        <span className="text-gray-700 text-[14px]">
                          {type.name} <span className="text-gray-500">({type.count})</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loại ghế / giường */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleGroup('Loại ghế / giường')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Loại ghế / giường</span>
              {isExpanded('Loại ghế / giường') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Loại ghế / giường') && (
              <div className="px-4 pb-4">
                <div className="flex flex-col gap-4 mt-2">
                  {seatTypes.map((type, i) => (
                    <label key={i} className="flex items-center justify-start cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-[18px] h-[18px] text-[#2474E5] border-gray-300 rounded focus:ring-0 cursor-pointer border-2"
                        />
                        <span className="text-gray-700 text-[15px]">
                          {type.name} <span className="text-gray-500">({type.count})</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Đánh giá */}
          <div className="border-b border-gray-100 pb-4">
            <button
              onClick={() => toggleGroup('Đánh giá')}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition w-full text-left"
            >
              <span className="font-bold text-gray-900 text-[15px]">Đánh giá</span>
              {isExpanded('Đánh giá') ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isExpanded('Đánh giá') && (
              <div className="px-4 pb-2">
                <div className="flex flex-col gap-3">
                  {ratings.map((rating, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`mx-0.5 ${star <= rating.stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-700 text-[14px]">
                        {rating.label} <span className="text-gray-500">({rating.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
}
