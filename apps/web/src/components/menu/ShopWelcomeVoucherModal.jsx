'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Gift, 
  X, 
  Check, 
  Tag, 
  Clock, 
  PartyPopper,
  Lock,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ShopWelcomeVoucherModal({ shopId, shopName }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [claimedCodes, setClaimedCodes] = useState({});
  const [loading, setLoading] = useState(false);
  const [claimingCode, setClaimingCode] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch active shop promotions & user claimed status
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

    const timer = setTimeout(fetchShopVouchers, 800);
    return () => clearTimeout(timer);
  }, [shopId]);

  // 2. Fetch vouchers that the logged-in user has already claimed
  useEffect(() => {
    if (!user?.id || !shopId) return;

    const fetchUserClaimed = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/promotions/user/claimed?userId=${user.id}&shopId=${shopId}`);
        if (res.ok) {
          const codes = await res.json();
          if (Array.isArray(codes)) {
            const map = {};
            codes.forEach(c => { map[c] = true; });
            setClaimedCodes(prev => ({ ...prev, ...map }));
          }
        }
      } catch (e) {
        console.error('Failed to load user claimed vouchers:', e);
      }
    };

    fetchUserClaimed();
  }, [user?.id, shopId]);

  // 3. Handle Claim Voucher
  const handleClaim = async (promo) => {
    // Check Authentication: User must be logged in to claim!
    if (!isAuthenticated || !user?.id) {
      setShowLoginPrompt(true);
      return;
    }

    setClaimingCode(promo.code);
    setErrorMessage('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fooddelivery_access_token') : null;
      const res = await fetch(`http://localhost:8080/api/v1/promotions/${promo.id}/claim?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'X-User-Id': String(user.id)
        }
      });

      if (res.ok) {
        setClaimedCodes(prev => ({ ...prev, [promo.code]: true }));
        try {
          const saved = JSON.parse(localStorage.getItem('claimed_shop_vouchers') || '{}');
          saved[shopId] = promo.code;
          localStorage.setItem('claimed_shop_vouchers', JSON.stringify(saved));
        } catch (e) {}
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.message || 'Không thể nhận mã lúc này. Mã có thể đã hết lượt!');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch (e) {
      console.error('Claim error:', e);
      setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng thử lại!');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setClaimingCode(null);
    }
  };

  if (!isOpen || vouchers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Background Confetti & Sparkles FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce opacity-70"
            style={{
              top: `${(i * 19) % 88}%`,
              left: `${(i * 23) % 94}%`,
              width: `${(i % 3) * 3 + 5}px`,
              height: `${(i % 3) * 3 + 5}px`,
              backgroundColor: ['#FFB800', '#FF385C', '#3B82F6', '#10B981', '#8B5CF6'][i % 5],
              animationDuration: `${1.6 + (i % 4) * 0.4}s`,
              animationDelay: `${(i % 8) * 0.15}s`
            }}
          />
        ))}
      </div>

      {/* Main Modal Card - Structured with max-h-[88vh] and flex-col to PREVENT ANY OVERFLOW */}
      <div className="relative w-full max-w-lg max-h-[88vh] flex flex-col bg-gradient-to-b from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-1 shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Glowing aura inside */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-400 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header (Fixed, shrink-0) */}
        <div className="relative pt-4 pb-2 px-5 text-center text-white shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-inner mb-2 transform hover:rotate-6 transition-transform">
            <Gift className="w-7 h-7 text-yellow-200 animate-bounce" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-yellow-200 bg-black/20 px-2.5 py-0.5 rounded-full border border-yellow-200/30">
              Quà tặng đặc biệt
            </span>
            <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          <h2 className="text-xl sm:text-2xl font-black drop-shadow-sm tracking-tight">
            🎉 Chúc Mừng Bạn!
          </h2>
          <p className="text-[11px] sm:text-xs text-orange-100 mt-0.5 max-w-sm mx-auto line-clamp-2">
            Quán <strong className="text-yellow-200 font-bold underline">{shopName || 'Gian hàng'}</strong> gửi tặng bạn các voucher ưu đãi độc quyền hôm nay:
          </p>

          {errorMessage && (
            <div className="mt-2 p-2 bg-red-600/90 text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Body / Voucher Tickets (Scrollable, flex-1 min-h-0) */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 space-y-2.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar shadow-inner mx-0.5">
          {vouchers.map((promo) => {
            const isClaimed = claimedCodes[promo.code];
            const isClaiming = claimingCode === promo.code;

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
                className="relative flex items-stretch rounded-xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white p-3 gap-2.5 shadow-2xs hover:shadow-sm transition-all group overflow-hidden"
              >
                {/* Left Ticket Notch */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-r border-amber-300" />
                {/* Right Ticket Notch */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-l border-amber-300" />

                {/* Left Icon Badge */}
                <div className="flex flex-col items-center justify-center w-14 shrink-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg text-white p-1.5 shadow-2xs">
                  <Tag className="w-4 h-4 mb-0.5 text-yellow-200" />
                  <span className="text-[9px] font-black uppercase text-center leading-tight">
                    Shop
                  </span>
                </div>

                {/* Voucher Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5 pl-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-black text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 tracking-wider">
                      {promo.code}
                    </span>
                    <span className="text-xs font-black text-slate-900 line-clamp-1">
                      {discountLabel} {maxCapLabel}
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-slate-600">
                    Đơn tối thiểu: <strong className="text-slate-800">{Number(promo.minOrderValue || 0).toLocaleString('vi-VN')}đ</strong>
                  </p>

                  {promo.validUntil && (
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>HSD: {new Date(promo.validUntil).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                {/* Claim Button */}
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    disabled={isClaimed || isClaiming}
                    onClick={() => handleClaim(promo)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                      isClaimed
                        ? 'bg-emerald-600 text-white shadow-emerald-200 cursor-default opacity-95'
                        : isClaiming
                        ? 'bg-amber-400 text-white cursor-wait'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-102 active:scale-98'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Đã lưu
                      </>
                    ) : isClaiming ? (
                      <span>Đang lưu...</span>
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

        {/* Modal Footer (Fixed, shrink-0) */}
        <div className="p-3 bg-orange-600/30 backdrop-blur-md flex items-center justify-between gap-2.5 text-white shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-yellow-100 font-medium">
            <PartyPopper className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="line-clamp-1">Mã đã lưu sẽ tự động khả dụng khi bạn thanh toán!</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-white text-orange-600 hover:bg-yellow-50 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            Đặt món ngay
          </button>
        </div>

        {/* Mandatory Login Prompt Overlay */}
        {showLoginPrompt && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-5 text-center max-w-xs w-full shadow-2xl text-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Yêu cầu đăng nhập</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Vui lòng đăng nhập tài khoản để nhận và lưu mã giảm giá của quán vào ví của bạn nhé!
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
                    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
