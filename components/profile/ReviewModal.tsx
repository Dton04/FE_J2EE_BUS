'use client';
import { useState, useRef, useCallback } from 'react';
import { X, Star, Camera, Trash2, Send, Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { reviewService, type ReviewRequest } from '@/services/reviewService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: number;
  bookingCode: string;
  routeName: string | null;
  departureTime: string | null;
}

// Sử dụng ảnh dạng preview local trước khi upload
interface LocalImage {
  file: File;
  previewUrl: string;
  uploading?: boolean;
  uploadedUrl?: string;
  error?: boolean;
}

const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  bookingCode,
  routeName,
  departureTime,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<LocalImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleClose = useCallback(() => {
    if (submitting) return;
    // Reset state on close
    setRating(0);
    setHoverRating(0);
    setComment('');
    setImages([]);
    setError(null);
    setSubmitted(false);
    onClose();
  }, [submitting, onClose]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_IMAGES = 5;
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    // Tạo preview ngay lập tức
    const newImages: LocalImage[] = toAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Upload từng ảnh song song
    const updated = await Promise.all(
      newImages.map(async (img, idx) => {
        try {
          const uploadedUrl = await reviewService.uploadImage(img.file);
          return { ...img, uploading: false, uploadedUrl };
        } catch {
          console.warn(`Lỗi upload ảnh thứ ${idx + 1}`);
          return { ...img, uploading: false, error: true };
        }
      })
    );

    setImages((prev) => {
      const base = prev.slice(0, prev.length - updated.length);
      return [...base, ...updated];
    });

    // Reset input để có thể chọn lại cùng file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nhận xét của bạn.');
      return;
    }

    // Kiểm tra ảnh nào còn đang upload
    const stillUploading = images.some((img) => img.uploading);
    if (stillUploading) {
      setError('Vui lòng chờ ảnh tải lên xong.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const successfulImageUrls = images
        .filter((img) => img.uploadedUrl)
        .map((img) => img.uploadedUrl as string);

      const payload: ReviewRequest = {
        booking_id: bookingId,
        rating,
        comment: comment.trim(),
        image_urls: successfulImageUrls,
      };

      await reviewService.createReview(payload);
      setSubmitted(true);

      // Gọi onSuccess sau 1.5s để người dùng thấy thông báo thành công
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      const msg =
        typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-xl">
              <Star size={22} className="text-yellow-500 fill-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800">Đánh giá chuyến đi</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-[260px]">
                {routeName || 'Chuyến đi'}
                {departureTime ? ` · ${formatTime(departureTime)}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Booking code */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Mã đặt vé</span>
            <span className="font-black text-blue-700 font-mono text-sm">#{bookingCode}</span>
          </div>

          {submitted ? (
            /* Success state */
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={44} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800">Cảm ơn bạn!</h3>
                <p className="text-gray-500 text-sm mt-1">Đánh giá của bạn đã được gửi thành công.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-bold text-gray-600">Bạn cảm thấy thế nào về chuyến đi này?</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125 active:scale-110"
                      aria-label={`${star} sao`}
                    >
                      <Star
                        size={40}
                        className={`transition-colors ${
                          star <= displayRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200 fill-gray-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {displayRating > 0 && (
                  <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                    {STAR_LABELS[displayRating]}
                  </span>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Nhận xét của bạn <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn về tài xế, xe, đúng giờ giấc..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                />
                <div className="flex justify-end">
                  <span className="text-xs text-gray-400 font-medium">{comment.length}/1000</span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Camera size={16} className="text-blue-500" />
                    Thêm ảnh <span className="font-normal text-gray-400">(tối đa 5 ảnh)</span>
                  </label>
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <ImagePlus size={14} />
                      Chọn ảnh
                    </button>
                  )}
                </div>

                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group border border-gray-200"
                      >
                        <Image
                          src={img.previewUrl}
                          alt={`Ảnh đánh giá ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                        {/* Overlay */}
                        {img.uploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 size={20} className="text-white animate-spin" />
                          </div>
                        )}
                        {img.error && (
                          <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                            <X size={20} className="text-white" />
                          </div>
                        )}
                        {!img.uploading && (
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            aria-label="Xóa ảnh"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add more button */}
                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <ImagePlus size={20} />
                        <span className="text-[10px] font-bold">Thêm</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Empty upload zone */}
                {images.length === 0 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <Camera size={32} className="opacity-60" />
                    <span className="text-sm font-medium">Nhấn để chọn ảnh</span>
                    <span className="text-xs">JPG, PNG, WEBP · Tối đa 10MB mỗi ảnh</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                  <X size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-gray-50/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              id="submit-review-btn"
              className="flex-1 py-3 bg-[#2474E5] hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
