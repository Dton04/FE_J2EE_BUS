'use client';
import { Facebook, Youtube, Music2 } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white pt-12">
      {/* Top Section - Route Links */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-100 text-sm">
        <div>
          <h3 className="font-bold mb-4 text-gray-800">Vé xe khách</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Xe đi Buôn Mê Thuột từ Sài Gòn</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Xe đi Vũng Tàu từ Sài Gòn</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Xe đi Nha Trang từ Sài Gòn</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Xe đi Đà Lạt từ Sài Gòn</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Xe đi Sapa từ Hà Nội</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-gray-800">Vé tàu hỏa</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Vé tàu Sài Gòn Nha Trang</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Vé tàu Sài Gòn Phan Thiết</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Vé tàu Sài Gòn Đà Nẵng</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Vé tàu Sài Gòn Hà Nội</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-gray-800">Vé máy bay</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Vé máy bay từ Hà Nội đi Sài Gòn</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Vé máy bay từ Sài Gòn đi Nha Trang</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Vé máy bay từ Sài Gòn đi Đà Nẵng</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4 text-gray-800">Thuê xe</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Thuê xe đi Ninh Bình</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Thuê xe đi Hạ Long</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Thuê xe đi Sapa</Link></li>
          </ul>
        </div>
      </div>

      {/* Middle Section - Company Info & Badges */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 py-12 text-sm">
        <div>
          <Link href="/" className="text-2xl font-bold flex items-center gap-2 mb-6 text-blue-600">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded">v</span>
            vexere
          </Link>
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="h-10 bg-gray-100 rounded border flex items-center justify-center grayscale text-[10px] text-gray-400">Badge 1</div>
             <div className="h-10 bg-gray-100 rounded border flex items-center justify-center grayscale text-[10px] text-gray-400">Badge 2</div>
             <div className="h-10 bg-gray-100 rounded border flex items-center justify-center grayscale text-[10px] text-gray-400">Badge 3</div>
             <div className="h-10 bg-gray-100 rounded border flex items-center justify-center grayscale text-[10px] text-gray-400">Badge 4</div>
          </div>
          <h4 className="font-bold mb-3 text-gray-800">Đối tác thanh toán</h4>
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="w-8 h-8 bg-gray-50 border rounded flex items-center justify-center text-[8px] text-gray-300">P{i}</div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-gray-800 uppercase text-xs tracking-wider">Về chúng tôi</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Giới Thiệu Vexere.com</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Tuyển dụng</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Tin tức</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Liên hệ</Link></li>
          </ul>
          <h3 className="font-bold mb-4 mt-6 text-gray-800 uppercase text-xs tracking-wider">Theo dõi chúng tôi trên</h3>
          <div className="flex gap-4">
            <Facebook size={20} className="text-blue-600 cursor-pointer" />
            <Music2 size={20} className="text-black cursor-pointer" />
            <Youtube size={20} className="text-red-600 cursor-pointer" />
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-gray-800 uppercase text-xs tracking-wider">Hỗ trợ</h3>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Hướng dẫn thanh toán</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Quy chế Vexere.com</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Chính sách bảo mật thông tin</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Chính sách bảo mật thanh toán</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-gray-800 uppercase text-xs tracking-wider">Trở thành đối tác</h3>
          <ul className="space-y-2 text-gray-500 text-xs">
            <li><Link href="/" className="hover:text-blue-600">Phần mềm quản lý nhà xe</Link></li>
            <li><Link href="/" className="hover:text-blue-600">Phần mềm quản lý đại lý</Link></li>
            <li><Link href="/" className="hover:text-blue-600">App quản lý hàng hoá</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="bg-black text-white py-12 text-center text-xs">
        <div className="max-w-4xl mx-auto px-4 space-y-4 opacity-70">
          <h3 className="text-sm font-bold opacity-100">Công ty TNHH Thương Mại Dịch Vụ Vexere</h3>
          <p>Địa chỉ đăng ký kinh doanh: 8C Chế Lan Viên, Phường Tây Thạnh, Quận Tân Phú, TP. Hồ Chí Minh, Việt Nam</p>
          <p>Địa chỉ: Lầu 2, tòa nhà HL, số 82 Duy Tân, Cầu Giấy, Hà Nội</p>
          <p>Giấy chứng nhận ĐKKD số 0315133726 do Sở KH và ĐT TP. Hồ Chí Minh cấp lần đầu ngày 27/6/2018</p>
          <p>Bản quyền © 2025 thuộc về Vexere.com</p>
        </div>
      </div>
    </footer>
  );
}
