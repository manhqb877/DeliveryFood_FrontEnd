import React, { useState, useEffect } from 'react';
import { dbService } from '@/api/client';
import { Review } from '@/api/mockData';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Star, MessageSquare, CornerDownRight, Check, ThumbsUp, Sparkles, UtensilsCrossed, Bike, Clock, User } from 'lucide-react';

export function ShopReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Filter
  const [filterRating, setFilterRating] = useState<string>('ALL');
  const [filterReplied, setFilterReplied] = useState<string>('ALL');

  // Reply modal
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const list = await dbService.getReviews(1); // shop 1
    setReviews(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendReply = async () => {
    if (!selectedReview) return;
    if (!replyInput.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi trước khi gửi!', 'Nội Dung Trống');
      return;
    }
    await dbService.replyReview(selectedReview.id, replyInput);
    toast.success(
      `Đã gửi phản hồi đánh giá cho đơn #${selectedReview.order_code}!`,
      'Phản Hồi Thành Công'
    );
    setSelectedReview(null);
    setReplyInput('');
    loadData();
  };

  const quickTemplates = [
    'Dạ quán cảm ơn quý khách rất nhiều vì đã tin tưởng ủng hộ! Quán sẽ luôn duy trì hương vị và chất lượng tốt nhất ạ ❤️',
    'Dạ quán thành thật xin lỗi vì trải nghiệm chưa trọn vẹn của bạn. Quán xin ghi nhận góp ý và điều chỉnh ngay ạ!',
    'Cảm ơn bạn đã phản hồi! Quán sẽ lưu ý về khẩu vị để đơn sau phục vụ bạn ngon miệng hơn nhé ạ!',
  ];

  // Calculations
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.shop_rating, 0) / totalReviews).toFixed(1) : '5.0';
  const fiveStarCount = reviews.filter((r) => r.shop_rating === 5).length;
  const fiveStarPercent = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100;
  const repliedCount = reviews.filter((r) => !!r.shop_reply).length;
  const replyRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;

  // Filtered list
  const filteredReviews = reviews.filter((r) => {
    if (filterRating === '5' && r.shop_rating !== 5) return false;
    if (filterRating === '4' && r.shop_rating !== 4) return false;
    if (filterRating === 'LOW' && r.shop_rating > 3) return false;
    if (filterReplied === 'NOT_REPLIED' && !!r.shop_reply) return false;
    if (filterReplied === 'REPLIED' && !r.shop_reply) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Đánh Giá & Phản Hồi Từ Khách Hàng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi mức độ hài lòng về món ăn, dịch vụ và phản hồi tương tác xây dựng uy tín gian hàng.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ★
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Điểm trung bình</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800">{avgRating}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng lượt đánh giá</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{totalReviews}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tỉ lệ 5 sao</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{fiveStarPercent}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CornerDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tỉ lệ phản hồi</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">{replyRate}%</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => { setFilterRating('ALL'); setFilterReplied('ALL'); }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              filterRating === 'ALL' && filterReplied === 'ALL'
                ? 'bg-[#0F2540] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalReviews})
          </button>
          <button
            onClick={() => { setFilterReplied('NOT_REPLIED'); setFilterRating('ALL'); }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              filterReplied === 'NOT_REPLIED'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Chưa phản hồi ({totalReviews - repliedCount})
          </button>
          <button
            onClick={() => { setFilterRating('5'); setFilterReplied('ALL'); }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              filterRating === '5'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            5 sao ⭐ ({fiveStarCount})
          </button>
          <button
            onClick={() => { setFilterRating('4'); setFilterReplied('ALL'); }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              filterRating === '4'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            4 sao ⭐ ({reviews.filter((r) => r.shop_rating === 4).length})
          </button>
          <button
            onClick={() => { setFilterRating('LOW'); setFilterReplied('ALL'); }}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              filterRating === 'LOW'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1-3 sao ({reviews.filter((r) => r.shop_rating <= 3).length})
          </button>
        </div>

        <button
          onClick={loadData}
          className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải đánh giá...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          Không có đánh giá nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm uppercase">
                    {rev.user_avatar ? (
                      <img src={rev.user_avatar} alt={rev.user_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      rev.user_name.slice(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{rev.user_name}</span>
                      <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                        Đơn #{rev.order_code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(rev.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Rating stars and breakdown */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-800 text-xs">{rev.shop_rating}.0 / 5</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    {rev.food_rating && (
                      <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                        <UtensilsCrossed className="w-3 h-3" /> Món: {rev.food_rating}★
                      </span>
                    )}
                    {rev.delivery_rating && (
                      <span className="flex items-center gap-0.5 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                        <Bike className="w-3 h-3" /> Giao: {rev.delivery_rating}★
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Review comment */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-slate-800 font-medium leading-relaxed">
                "{rev.shop_comment}"
              </div>

              {/* Photos */}
              {rev.image_urls && rev.image_urls.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.image_urls.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Ảnh đánh giá"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              )}

              {/* Shop reply section */}
              {rev.shop_reply ? (
                <div className="ml-4 pl-3.5 border-l-2 border-emerald-500 bg-emerald-50/70 p-3 rounded-r-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Phản hồi từ quán:</span>
                    {rev.shop_replied_at && (
                      <span className="text-[10px] text-emerald-700 font-normal font-mono">
                        ({new Date(rev.shop_replied_at).toLocaleDateString('vi-VN')})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{rev.shop_reply}</p>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedReview(rev);
                      setReplyInput('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F2540] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Phản Hồi Đánh Giá</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Phản Hồi Đánh Giá Của Khách Hàng"
        subtitle={`Khách hàng: ${selectedReview?.user_name} — Đơn hàng #${selectedReview?.order_code}`}
        maxWidth="xl"
      >
        {selectedReview && (
          <div className="space-y-4 text-xs">
            {/* Original review preview */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedReview.shop_rating} sao</span>
              </div>
              <p className="text-slate-700 italic">"{selectedReview.shop_comment}"</p>
            </div>

            {/* Quick response templates */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Mẫu phản hồi nhanh:
              </label>
              <div className="space-y-1.5">
                {quickTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReplyInput(tpl)}
                    className="w-full text-left p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-600 cursor-pointer transition-colors"
                  >
                    "{tpl}"
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Nội dung phản hồi (Shop Manager gửi đến khách):
              </label>
              <textarea
                rows={4}
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Nhập nội dung phản hồi chân thành, lịch sự..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1 italic">
                * Lưu ý: Mỗi đánh giá chỉ được phản hồi 1 lần duy nhất theo quy định nền tảng.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedReview(null)}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSendReply}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer shadow-sm"
              >
                Gửi Phản Hồi
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
