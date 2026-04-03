import { api } from './api';

export interface ReviewRequest {
  booking_id: number;
  trip_id?: number;
  rating: number;         // 1-5 sao
  comment: string;
  image_urls?: string[];  // URLs ảnh đã upload
}

export interface ReviewResponse {
  id: number;
  booking_id: number;
  trip_id?: number;
  rating: number;
  comment: string;
  image_urls?: string[];
  route_name?: string;
  departure_time?: string;
  created_at: string;
  updated_at?: string;
  user_name?: string;
}

export const reviewService = {
  /**
   * Tạo đánh giá mới cho một booking đã hoàn thành
   * POST /reviews
   */
  createReview: async (request: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post('/reviews', request);
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      return (data as { data: ReviewResponse }).data;
    }
    return data as ReviewResponse;
  },

  /**
   * Lấy tất cả đánh giá của người dùng hiện tại
   * GET /me/reviews
   */
  getMyReviews: async (): Promise<ReviewResponse[]> => {
    const response = await api.get('/me/reviews');
    const data = response.data;
    if (data && typeof data === 'object' && 'data' in data) {
      const inner = (data as { data: unknown }).data;
      return Array.isArray(inner) ? inner : [];
    }
    return Array.isArray(data) ? data : [];
  },

  /**
   * Lấy đánh giá theo booking_id (kiểm tra đã đánh giá chưa)
   * GET /reviews/booking/:bookingId
   */
  getReviewByBooking: async (bookingId: number): Promise<ReviewResponse | null> => {
    try {
      const response = await api.get(`/reviews/booking/${bookingId}`);
      const data = response.data;
      if (data && typeof data === 'object' && 'data' in data) {
        return (data as { data: ReviewResponse }).data;
      }
      return data as ReviewResponse;
    } catch {
      return null; // 404 = chưa đánh giá
    }
  },

  /**
   * Upload ảnh đánh giá
   * POST /reviews/upload-image (multipart/form-data)
   * Returns URL của ảnh đã lưu
   */
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/reviews/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = response.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      return (record.url || record.data || record.image_url || '') as string;
    }
    return '';
  },

  /**
   * Xóa đánh giá theo id
   * DELETE /reviews/:id
   */
  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },
};
