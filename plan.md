ĐỀ TÀI: WEBSITE ĐẶT VÉ XE KHÁCH (BUS BOOKING SYSTEM)
I: MÔ TẢ CHỨC NĂNG
1. Khách hàng (Customer / User)
•	Tìm kiếm chuyến xe: Tìm theo điểm đi, điểm đến, ngày khởi hành. Hệ thống tự động tìm cả chuyến đi thẳng và chuyến nối (nếu không có chuyến thẳng hoặc khách muốn thêm lựa chọn).
•	Gợi ý loại xe: Hiển thị nhãn gợi ý (Ví dụ: "Giá tốt nhất", "Xe Limousine cao cấp") dựa trên tiện ích và giá vé.
•	Đặt vé (Booking): Chọn chuyến (đơn hoặc nối), chọn ghế (Seat map), thanh toán online (VNPAY/Momo) hoặc giữ chỗ.
•	Quản lý cá nhân: Cập nhật thông tin cá nhân, đổi mật khẩu và xem lịch sử vé.
•	Quản lý vé: Hủy vé (theo chính sách), lấy mã QR để lên xe.
2. Nhân viên (Staff / Driver)
•	Bán vé tại quầy (Counter): Đặt vé cho khách vãng lai, thu tiền mặt.
•	Soát vé (Check-in): Quét mã QR, cập nhật trạng thái "Đã lên xe".
•	Quản lý trạng thái chuyến: Cập nhật trạng thái xe thực tế (Đang chạy, Đã đến, Delay) để khách hàng theo dõi.
•	Kiểm tra danh sách: Xem danh sách hành khách trên chuyến xe mình phụ trách.
3. Quản trị viên (Admin - Nhà xe)
•	Quản lý Tuyến & Xe: Định nghĩa lộ trình, bến xe, quản lý đội xe (Biển số, số ghế, tiện ích).
•	Điều phối chuyến (Scheduling): Lên lịch chạy (Gán xe vào tuyến lúc mấy giờ).
•	Quản lý Giá vé: Thiết lập giá cơ bản hoặc tăng giá theo lịch trình ngày lễ.
•	Báo cáo: Doanh thu, tỷ lệ lấp đầy (Fill rate), tỷ lệ hủy vé.
________________________________________
II: DATABASE (Chuẩn 3NF)
Bổ sung Stations và chuẩn hoá Booking/Ticket để hỗ trợ chuyến nối + giữ chỗ + thanh toán online.
1.	Users: user_id [PK], username (unique), password_hash, full_name, phone, role (ADMIN, STAFF, CUSTOMER, DRIVER), is_locked, created_at, updated_at.
2.	Stations: station_id [PK], name, city, address.
3.	Buses: bus_id [PK], license_plate (unique), bus_type, total_seats, status, created_at, updated_at.
4.	Seats: seat_id [PK], bus_id [FK], seat_number.
5.	Routes: route_id [PK], origin_id [FK_Station], destination_id [FK_Station], base_price, distance_km, estimated_duration, created_at, updated_at.
6.	Trips: trip_id [PK], route_id [FK], bus_id [FK], departure_time, arrival_time, actual_price, status, created_at, updated_at.
7.	TripStops: trip_stop_id [PK], trip_id [FK], station_id [FK_Station], stop_type (PICKUP, DROPOFF), stop_time, address_detail, order_index.
8.	Bookings: booking_id [PK], booking_code (unique), user_id [FK, nullable], total_amount, booking_status, payment_status, hold_expires_at (nullable), created_at, updated_at.
9.	Tickets: ticket_id [PK], booking_id [FK], trip_id [FK], seat_number, passenger_name, phone, price, ticket_status (ACTIVE, CANCELLED), check_in_status (NOT_YET, ON_BOARD), created_at, updated_at.
10.	SeatHolds: hold_id [PK], trip_id [FK], seat_number, booking_id [FK, nullable], hold_status (HOLDING, RELEASED, CONFIRMED), expires_at, created_at.
11.	Payments: payment_id [PK], booking_id [FK], amount, payment_method (VNPAY, MOMO, CASH), status (PENDING, SUCCESS, FAILED, REFUNDED), transaction_ref (unique), created_at, updated_at.
12.	Reviews: review_id [PK], user_id [FK], trip_id [FK], rating (1-5), comment, created_at.
13.	Notifications: notification_id [PK], user_id [FK], message, is_read, created_at.

Ràng buộc quan trọng:
•	Tickets: unique(trip_id, seat_number) để chống bán trùng ghế.
•	SeatHolds: unique(trip_id, seat_number) với điều kiện hold_status = HOLDING (tuỳ DB) để chống giữ trùng ghế.
•	Bookings.user_id có thể null để hỗ trợ khách vãng lai/guest tại quầy hoặc tra cứu theo booking_code + phone.

III: DANH SÁCH API ENDPOINTS
1. Đăng ký tài khoản
•	Endpoint: POST /api/v1/auth/register
•	Phân quyền: Public
•	Nghiệp vụ: Tạo tài khoản mới, mặc định role CUSTOMER.
•	Request: { "username": "...", "password": "...", "full_name": "..." }
•	Response: { "message": "Register success", "user_id": 1 } (201 Created)
2. Đăng nhập
•	Endpoint: POST /api/v1/auth/login
•	Phân quyền: Public
•	Nghiệp vụ: Trả về Access Token & Refresh Token.
•	Request: { "username": "admin", "password": "123" }
•	Response: { "access_token": "ey...", "refresh_token": "...", "role": "ADMIN" } (200 OK)
3. Làm mới Token (Refresh)
•	Endpoint: POST /api/v1/auth/refresh
•	Phân quyền: Authenticated (Via Refresh Token)
•	Nghiệp vụ: Cấp lại Access Token mới khi cái cũ hết hạn.
•	Response: { "access_token": "new_ey..." }
4. Đổi mật khẩu
•	Endpoint: PUT /api/v1/auth/change-password
•	Phân quyền: Authenticated
•	Request: { "old_pass": "...", "new_pass": "..." }
•	Response: { "message": "Success" }
5. Lấy thông tin cá nhân (Me)
•	Endpoint: GET /api/v1/users/profile
•	Phân quyền: Authenticated
•	Response: { "user_id": 1, "full_name": "Nguyen Van A", "role": "STAFF" }
6. Tạo nhân viên mới (Admin)
•	Endpoint: POST /api/v1/admin/users
•	Phân quyền: Admin
•	Validate: Username chưa tồn tại.
•	Request: { "username": "staff1", "password": "123", "role": "STAFF" }
•	Response: { "user_id": 2, "message": "Created" }
7. Lấy danh sách nhân viên
•	Endpoint: GET /api/v1/admin/users
•	Phân quyền: Admin
•	Response: [ { "id": 2, "username": "staff1", "is_locked": false } ]
8. Khóa/Mở khóa tài khoản
•	Endpoint: PATCH /api/v1/admin/users/{id}/lock
•	Phân quyền: Admin
•	Request: { "is_locked": true }
•	Response: { "message": "User status updated" }

I. Module: Quản lý Tuyến & Xe (Admin)
9. Lấy danh sách tuyến đường
•	GET /api/v1/routes
•	Response: [ {"id": 1, "name": "HN - Sapa", "price": 250k} ]
9.1. Quản lý bến xe / điểm đón trả
•	GET /api/v1/stations
•	POST /api/v1/admin/stations
•	PUT /api/v1/admin/stations/{id}
•	DELETE /api/v1/admin/stations/{id}
10. Thêm xe mới (Nhập đội xe)
•	POST /api/v1/admin/buses
•	Request: {"license_plate": "29B-12345", "seats": 40}
11. Lên lịch chạy (Tạo Trip)
•	POST /api/v1/admin/trips
•	Nghiệp vụ: Chọn Tuyến + Chọn Xe + Chọn Giờ -> Tạo Trip.
•	Request:
JSON
{
  "route_id": 1,
  "bus_id": 5,
  "departure_time": "2026-02-10 20:00:00",
  "price_modifier": 300000
}
11.1. Quản lý điểm đón/trả theo chuyến
•	POST /api/v1/admin/trips/{id}/stops
•	GET /api/v1/trips/{id}/stops
•	PUT /api/v1/admin/trips/{id}/stops/{stop_id}
•	DELETE /api/v1/admin/trips/{id}/stops/{stop_id}

II. Module: Chuyến xe & Tìm kiếm
12. Tìm kiếm chuyến xe (Quan trọng)
•	GET /api/v1/trips
•	Query: ?origin_id=1&destination_id=2&date=2026-02-10&max_legs=2&min_layover_minutes=30
•	Response:
JSON
[
  {
    "type": "DIRECT",
    "total_price": 300000,
    "legs": [
      { "trip_id": 101, "departure": "20:00", "arrival": "23:00", "bus_type": "Limousine" }
    ]
  },
  {
    "type": "CONNECTING",
    "total_price": 500000,
    "legs": [
      { "trip_id": 201, "origin": "Hà Nội", "destination": "Phú Thọ", "departure": "08:00", "arrival": "10:00" },
      { "trip_id": 202, "origin": "Phú Thọ", "destination": "Sapa", "departure": "11:30", "arrival": "14:00" }
    ],
    "layover_time": "90 mins"
  }
]
13. Lấy sơ đồ ghế (Seat Map)
•	Logic: Lấy danh sách Seats của Bus, trừ các seat_number đã có trong Tickets (ACTIVE) và SeatHolds (HOLDING, chưa hết hạn).
•	Response: {"A01": "BOOKED", "A02": "HELD", "A03": "AVAILABLE", ...}

III. Module: Đặt vé (Booking System)
14. Đặt vé (Checkout)
•	POST /api/v1/bookings
•	Phân quyền: Authenticated (User/Staff) hoặc Guest (tại quầy).
•	Request: Hỗ trợ mảng các chặng (legs) để đặt chuyến nối.
•	Logic:
o	Tạo Booking trạng thái HOLDING hoặc PENDING_PAYMENT và sinh booking_code.
o	Giữ ghế bằng SeatHolds với hold_expires_at (ví dụ 10 phút) cho tất cả các chặng.
o	Khi thanh toán thành công thì tạo Tickets (ACTIVE) và chuyển Booking sang CONFIRMED.
o	Nếu quá hạn giữ chỗ thì release SeatHolds và Booking chuyển EXPIRED.
14.1. Tạo yêu cầu thanh toán
•	POST /api/v1/payments
•	Nghiệp vụ: Tạo transaction_ref, gọi cổng thanh toán để lấy payment_url/qr, trả về cho frontend.
14.2. Callback/IPN từ cổng thanh toán
•	POST /api/v1/payments/vnpay/callback
•	POST /api/v1/payments/momo/callback
•	Nghiệp vụ: Verify chữ ký, xử lý idempotent theo transaction_ref, update Payments + Bookings + tạo Tickets.
14.3. Xác nhận thu tiền mặt tại quầy
•	POST /api/v1/bookings/{id}/confirm-cash
•	Phân quyền: Staff
15. Hủy vé
•	PUT /api/v1/bookings/{id}/cancel
•	Logic:
1.	Check quy định (trước giờ khởi hành 24h mới được hủy).
2.	Update status = CANCELLED.
3.	Update ticket_status = CANCELLED và release ghế theo Tickets/SeatHolds.
16. Check-in (Dành cho Lơ xe/Staff)
•	PATCH /api/v1/tickets/{ticket_id}/check-in
•	Nghiệp vụ: Quét QR code, đổi status vé thành "ON_BOARD".
16.1. Danh sách hành khách theo chuyến
•	GET /api/v1/trips/{id}/passengers
•	Phân quyền: Staff/Driver
17. Xem danh sách vé của tôi (My Bookings)
Dùng cho màn hình "Vé của tôi" trong App/Web. Cần chia tab: Sắp đi (Upcoming) và Lịch sử (History).
•	Endpoint: GET /api/v1/me/bookings
•	Phân quyền: Authenticated (User đăng nhập).
•	Query Params:
o	?type=UPCOMING: Lấy các chuyến có departure_time > Hiện tại (Sắp đi).
o	?type=HISTORY: Lấy các chuyến đã đi hoặc đã hủy.
•	Response:
JSON
[
  {
    "booking_id": 105,
    "booking_code": "VEXE-8899", // Mã vé hiển thị
    "route_name": "Hà Nội - Sapa",
    "departure_time": "2026-02-10 20:00:00",
    "total_amount": 600000,
    "seat_count": 2,
    "status": "CONFIRMED", // Màu xanh lá
    "payment_status": "PAID"
  },
  {
    "booking_id": 98,
    "booking_code": "VEXE-1122",
    "route_name": "Sapa - Hà Nội",
    "status": "CANCELLED" // Màu đỏ
  }
]
18. Xem chi tiết vé & Lấy mã lên xe (E-Ticket Detail)
Đây là màn hình quan trọng nhất. Khi khách ra xe, họ sẽ mở màn hình này đưa cho lơ xe/tài xế xem.
•	Endpoint: GET /api/v1/bookings/{id}
•	Phân quyền: Authenticated (Chỉ xem được vé do chính mình đặt).
•	Logic:
o	Trả về đầy đủ thông tin để render vé điện tử.
o	QR Code String: Chuỗi để tạo mã QR (VD: BUS|105|A01,A02|SECURE_HASH).
•	Response:
JSON
{
  "booking_info": {
    "booking_code": "VEXE-8899",
    "status": "CONFIRMED",
    "created_at": "2026-01-26 10:00:00"
  },
  "trip_info": {
    "route": "Hà Nội -> Sapa",
    "bus_plate": "29B-12345",
    "bus_type": "Limousine 34",
    "departure": "20:00 10/02/2026",
    "pickup_point": "Bến xe Mỹ Đình"
  },
  "tickets": [
    { "seat": "A01", "passenger": "Nguyen Van A" },
    { "seat": "A02", "passenger": "Tran Thi B" }
  ],
  "payment": {
    "method": "VNPAY",
    "total": 600000
  },
  "qr_string": "VEXE-8899|A01,A02|CONFIRMED",
  "policies": "Vui lòng có mặt trước 30 phút. Vé không hoàn hủy trước giờ đi 24h."
}
19. Tra cứu vé (Dành cho khách Guest / Quên đăng nhập)
Rất nhiều khách mua vé xong quên đăng nhập, hoặc mua giúp người thân. Họ cần một trang tra cứu công khai.
•	Endpoint: POST /api/v1/bookings/lookup (Hoặc GET với query params)
•	Phân quyền: Public.
•	Validate: Bắt buộc nhập đúng cặp Mã vé (Booking Code) VÀ Số điện thoại (để bảo mật, tránh người lạ dò mã vé xem thông tin).
•	Request:
JSON
{
  "booking_code": "VEXE-8899",
  "phone": "0987654321"
}
•	Response: (Tương tự API số 18 nhưng giới hạn bớt thông tin nhạy cảm nếu cần).
20. Tải vé (Download PDF/Image)
Chức năng phụ nhưng rất hữu ích ("In vé").
•	Endpoint: GET /api/v1/bookings/{id}/download
•	Phân quyền: Authenticated / Public (nếu có token truy cập tạm thời).
•	Response: Trả về file PDF stream hoặc Image URL chứa thông tin vé đã format đẹp để khách lưu vào điện thoại.

V. Module: Báo Cáo (Thay cho Stats)
21. Thống kê Doanh thu theo Tuyến
•	GET /api/v1/stats/revenue-by-route
•	Query: ?month=02-2026
22. Báo cáo tỷ lệ lấp đầy (Occupancy)
•	GET /api/v1/stats/occupancy
•	Mục đích: Biết tuyến nào vắng khách để giảm chuyến, tuyến nào đông để tăng chuyến.
•	Logic: (Total Booked Seats / Total Capacity) * 100.

