CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'STAFF', 'CUSTOMER', 'DRIVER'))
);

CREATE TABLE stations (
  station_id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(120),
  address VARCHAR(255)
);

CREATE TABLE buses (
  bus_id BIGSERIAL PRIMARY KEY,
  license_plate VARCHAR(30) NOT NULL UNIQUE,
  bus_type VARCHAR(60),
  total_seats INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT buses_total_seats_check CHECK (total_seats > 0),
  CONSTRAINT buses_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE'))
);

CREATE TABLE seats (
  seat_id BIGSERIAL PRIMARY KEY,
  bus_id BIGINT NOT NULL REFERENCES buses(bus_id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  CONSTRAINT seats_bus_seat_unique UNIQUE (bus_id, seat_number)
);

CREATE TABLE routes (
  route_id BIGSERIAL PRIMARY KEY,
  origin_id BIGINT NOT NULL REFERENCES stations(station_id),
  destination_id BIGINT NOT NULL REFERENCES stations(station_id),
  base_price BIGINT NOT NULL,
  distance_km NUMERIC(10, 2),
  estimated_duration_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT routes_base_price_check CHECK (base_price >= 0),
  CONSTRAINT routes_origin_destination_check CHECK (origin_id <> destination_id)
);

CREATE TABLE trips (
  trip_id BIGSERIAL PRIMARY KEY,
  route_id BIGINT NOT NULL REFERENCES routes(route_id),
  bus_id BIGINT NOT NULL REFERENCES buses(bus_id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  actual_price BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trips_actual_price_check CHECK (actual_price >= 0),
  CONSTRAINT trips_status_check CHECK (status IN ('SCHEDULED', 'DELAYED', 'RUNNING', 'ARRIVED', 'CANCELLED'))
);

CREATE TABLE trip_stops (
  trip_stop_id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  station_id BIGINT NOT NULL REFERENCES stations(station_id),
  stop_type VARCHAR(10) NOT NULL,
  stop_time TIMESTAMPTZ,
  address_detail VARCHAR(255),
  order_index INT NOT NULL,
  CONSTRAINT trip_stops_stop_type_check CHECK (stop_type IN ('PICKUP', 'DROPOFF')),
  CONSTRAINT trip_stops_trip_order_unique UNIQUE (trip_id, order_index)
);

CREATE TABLE bookings (
  booking_id BIGSERIAL PRIMARY KEY,
  booking_code VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT REFERENCES users(user_id),
  total_amount BIGINT NOT NULL DEFAULT 0,
  booking_status VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  hold_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bookings_total_amount_check CHECK (total_amount >= 0),
  CONSTRAINT bookings_booking_status_check CHECK (booking_status IN ('HOLDING', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED')),
  CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED'))
);

CREATE TABLE tickets (
  ticket_id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  trip_id BIGINT NOT NULL REFERENCES trips(trip_id),
  seat_number VARCHAR(10) NOT NULL,
  passenger_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20),
  price BIGINT NOT NULL,
  ticket_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  check_in_status VARCHAR(20) NOT NULL DEFAULT 'NOT_YET',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tickets_price_check CHECK (price >= 0),
  CONSTRAINT tickets_ticket_status_check CHECK (ticket_status IN ('ACTIVE', 'CANCELLED')),
  CONSTRAINT tickets_check_in_status_check CHECK (check_in_status IN ('NOT_YET', 'ON_BOARD')),
  CONSTRAINT tickets_trip_seat_unique UNIQUE (trip_id, seat_number)
);

CREATE TABLE seat_holds (
  hold_id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  booking_id BIGINT REFERENCES bookings(booking_id) ON DELETE SET NULL,
  hold_status VARCHAR(20) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT seat_holds_hold_status_check CHECK (hold_status IN ('HOLDING', 'RELEASED', 'CONFIRMED'))
);

CREATE UNIQUE INDEX seat_holds_trip_seat_unique_holding
  ON seat_holds (trip_id, seat_number)
  WHERE hold_status = 'HOLDING';

CREATE TABLE payments (
  payment_id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  transaction_ref VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_amount_check CHECK (amount >= 0),
  CONSTRAINT payments_payment_method_check CHECK (payment_method IN ('VNPAY', 'MOMO', 'CASH')),
  CONSTRAINT payments_status_check CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'))
);

CREATE TABLE reviews (
  review_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  trip_id BIGINT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_user_trip_unique UNIQUE (user_id, trip_id)
);

CREATE TABLE notifications (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX routes_origin_destination_idx ON routes(origin_id, destination_id);
CREATE INDEX trips_departure_time_idx ON trips(departure_time);
CREATE INDEX tickets_booking_id_idx ON tickets(booking_id);
CREATE INDEX tickets_trip_id_idx ON tickets(trip_id);
CREATE INDEX seat_holds_expires_at_idx ON seat_holds(expires_at);
