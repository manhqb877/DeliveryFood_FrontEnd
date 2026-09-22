import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Star, MessageSquare, User, ChevronDown, RefreshCw, Package } from 'lucide-react';

interface ReviewRecord {
  id: number;
  order_code: string;
  complainant_name: string;
  reason_type: string;
  description: string;
  status: string;
  shipper_id?: number;
  shipper_rating?: number;
  shop_id?: number;
  shop_rating?: number;
  shop_comment?: string;
  image_urls?: string[];
  resolution?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export function ComplaintsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<'ALL' | 'LOW' | 'HIGH'>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await dbService.getComplaints();
    setReviews(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = reviews.filter(r => {
    if (ratingFilter === 'LOW') return (r.shipper_rating != null && r.shipper_rating <= 3);
    if (ratingFilter === 'HIGH') return (r.shipper_rating != null && r.shipper_rating >= 4);
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.shipper_rating || 0), 0) / reviews.filter(r => r.shipper_rating).length).toFixed(1)
    : '—';

  const lowRatingCount = reviews.filter(r => r.shipper_rating != null && r.shipper_rating <= 3).length;

  const renderStars = (rating?: number) => {
    if (rating == null) return <span className="text-slate-400 text-xs">—</span>;
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-600">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đánh giá Shipper từ Khách hàng</h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi phản hồi của khách hàng về chất lượng giao hàng</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng đánh giá', value: reviews.length, color: 'bg-blue-50 text-blue-600', icon: MessageSquare },
          { label: 'Đánh giá thấp (≤3★)', value: lowRatingCount, color: 'bg-rose-50 text-rose-600', icon: Star },
          { label: 'Điểm TB Shipper', value: avgRating + '★', color: 'bg-amber-50 text-amber-600', icon: Star },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`${color.split(' ')[0]} rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'LOW', label: '⚠️ Đánh giá thấp (≤3★)' },
          { key: 'HIGH', label: '✅ Đánh giá tốt (≥4★)' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRatingFilter(key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              ratingFilter === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Review List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          Đang tải dữ liệu...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800 text-sm">{r.complainant_name}</span>
                    <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {r.order_code}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">{r.description}</p>
                </div>

                {/* Shipper Rating */}
                <div className="shrink-0 flex items-center gap-3">
                  {renderStars(r.shipper_rating ?? undefined)}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === r.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === r.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Shipper Review */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        🛵 Đánh giá Shipper
                        {r.shipper_id && (
                          <span className="text-xs text-slate-400 font-normal">ID #{r.shipper_id}</span>
                        )}
                      </h4>
                      <div className="mb-2">{renderStars(r.shipper_rating ?? undefined)}</div>
                      <p className="text-sm text-slate-600 italic">
                        "{r.description || '(Không có nhận xét)'}"
                      </p>
                    </div>

                    {/* Shop Review */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                        🏪 Đánh giá Quán
                        {r.shop_id && (
                          <span className="text-xs text-slate-400 font-normal">ID #{r.shop_id}</span>
                        )}
                      </h4>
                      <div className="mb-2">{renderStars(r.shop_rating ?? undefined)}</div>
                      <p className="text-sm text-slate-600 italic">
                        "{r.shop_comment || '(Không có nhận xét)'}"
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  {r.image_urls && r.image_urls.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">Ảnh đính kèm</p>
                      <div className="flex gap-2">
                        {r.image_urls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Package className="w-3.5 h-3.5" />
                    Đơn hàng: <span className="font-mono font-bold text-blue-600">{r.order_code}</span>
                    {r.shipper_rating != null && r.shipper_rating <= 3 && (
                      <span className="ml-2 bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">
                        ⚠️ Đánh giá thấp
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
