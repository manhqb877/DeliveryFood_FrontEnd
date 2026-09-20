'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Gift, 
  X, 
  Check, 
  Copy, 
  Tag, 
  Flame, 
  Clock, 
  ShoppingBag,
  PartyPopper
} from 'lucide-react';

export default function ShopWelcomeVoucherModal({ shopId, shopName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [claimedCodes, setClaimedCodes] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shopId) return;

    // Check if user already saw welcome voucher for this shop in this session
    const sessionKey = `welcomed_shop_${shopId}`;
    const alreadySeen = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;

    if (alreadySeen) return;

    const fetchShopVouchers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/v1/promotions/shop/${shopId}/active`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setVouchers(data);
            setIsOpen(true);
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (err) {
        console.error('Error fetching shop vouchers for popup:', err);
      } finally {
        setLoading(false);
      }
    };

    // Small delay for smooth entry after page load
    const timer = setTimeout(fetchShopVouchers, 800);
    return () => clearTimeout(timer);
  }, [shopId]);

  const handleClaim = (promo) => {
    setClaimedCodes(prev => ({ ...prev, [promo.code]: true }));
    
    // Save to localStorage so checkout can easily pre-suggest or auto-fill
    try {
      const saved = JSON.parse(localStorage.getItem('claimed_shop_vouchers') || '{}');
      saved[shopId] = promo.code;
      localStorage.setItem('claimed_shop_vouchers', JSON.stringify(saved));
      
      // Also copy to clipboard for user convenience
      if (navigator.clipboard) {
        navigator.clipboard.writeText(promo.code);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || vouchers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Background Confetti & Sparkles FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating confetti shapes */}
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce opacity-80"
            style={{
              top: `${(i * 17) % 90}%`,
              left: `${(i * 23) % 95}%`,
              width: `${(i % 3) * 4 + 6}px`,
              height: `${(i % 3) * 4 + 6}px`,
              backgroundColor: ['#FFB800', '#FF385C', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][i % 6],
              animationDuration: `${1.5 + (i % 5) * 0.4}s`,
              animationDelay: `${(i % 10) * 0.15}s`
            }}
          />
        ))}
      </div>

      {/* Main Modal Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-1 shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Glowing aura inside */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-300 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-400 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="relative pt-6 pb-4 px-6 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-inner mb-3 transform hover:rotate-6 transition-transform">
            <Gift className="w-9 h-9 text-yellow-200 animate-bounce" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-200 bg-black/20 px-3 py-1 rounded-full border border-yellow-200/30">
              Quà tặng đặc biệt
            </span>
            <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          <h2 className="text-2xl font-black drop-shadow-sm tracking-tight">
            🎉 Chúc Mừng Bạn!
          </h2>
          <p className="text-xs text-orange-100 mt-1 max-w-sm mx-auto">
            Quán <strong className="text-yellow-200 font-bold underline">{shopName || 'Gian hàng'}</strong> gửi tặng bạn các voucher ưu đãi độc quyền hôm nay:
          </p>
        </div>

        {/* Modal Body / Voucher Tickets */}
        <div className="bg-white rounded-2xl p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar shadow-inner">
          {vouchers.map((promo) => {
            const isClaimed = claimedCodes[promo.code];
            const discountLabel = promo.promoType === 'PERCENT'
              ? `Giảm ${promo.discountValue}%`
              : promo.promoType === 'FREE_DELIVERY'
              ? 'Freeship 15K'
              : `Giảm ${Number(promo.discountValue).toLocaleString('vi-VN')}đ`;

            const maxCapLabel = promo.maxDiscountAmount && Number(promo.maxDiscountAmount) > 0
              ? `(Tối đa ${Number(promo.maxDiscountAmount).toLocaleString('vi-VN')}đ)`
              : '';

            return (
              <div 
                key={promo.id || promo.code}
                className="relative flex items-stretch rounded-2xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white p-3.5 gap-3 shadow-xs hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Left Ticket Notch */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-r border-amber-300" />
                {/* Right Ticket Notch */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-l border-amber-300" />

                {/* Left Icon Badge */}
                <div className="flex flex-col items-center justify-center w-16 shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white p-2 shadow-xs">
                  <Tag className="w-5 h-5 mb-1 text-yellow-200" />
                  <span className="text-[10px] font-black uppercase text-center leading-tight">
                    Shop
                  </span>
                </div>

                {/* Voucher Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 pl-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded border border-orange-200 tracking-wider">
                      {promo.code}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {discountLabel} {maxCapLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Đơn tối thiểu: <strong className="text-slate-800">{Number(promo.minOrderValue || 0).toLocaleString('vi-VN')}đ</strong>
                  </p>

                  {promo.validUntil && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>HSD: {new Date(promo.validUntil).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                {/* Claim / Apply Button */}
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleClaim(promo)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isClaimed
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Đã lưu
                      </>
                    ) : (
                      <>
                        <Gift className="w-3.5 h-3.5" />
                        Nhận ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-orange-600/30 backdrop-blur-md flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2 text-xs text-yellow-100 font-medium">
            <PartyPopper className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="line-clamp-1">Mã đã lưu sẽ tự động khả dụng khi bạn thanh toán!</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 bg-white text-orange-600 hover:bg-yellow-50 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            Đặt món ngay
          </button>
        </div>

      </div>
    </div>
  );
}
