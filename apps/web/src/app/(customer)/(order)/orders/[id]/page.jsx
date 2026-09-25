'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Clock, MapPin, Package, Receipt, Truck, Star } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import AccountSidebarLayout from '@/components/layout/AccountSidebarLayout';

const ShipperTrackingMap = dynamic(
  () => import('@/components/ShipperTrackingMap').then(mod => mod.ShipperTrackingMap),
  { ssr: false, loading: () => <div className="w-full h-64 bg-slate-100 animate-pulse rounded-xl" /> }
);

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deliveryData, setDeliveryData] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    shopRating: 5,
    shopComment: '',
    shipperRating: 5,
    shipperComment: '',
    productReviews: []
  });

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails(params.id);
    }
  }, [params.id]);

  const fetchOrderDetails = async (orderId) => {
    try {
      // Lấy từ authService hoặc TOKEN_KEYS
      let token = null;
      let userId = null;
      let guestId = null;

      if (typeof window !== 'undefined') {
        token = localStorage.getItem('fooddelivery_access_token');
        const userStr = localStorage.getItem('fooddelivery_user');
        if (userStr) {
          try {
            userId = JSON.parse(userStr).id;
          } catch (e) {}
        }
        guestId = localStorage.getItem('befood_guest_session_id');
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        if (userId) {
          headers['X-User-Id'] = userId;
        }
      } else if (guestId) {
        headers['X-Guest-Session-Id'] = guestId;
      }

      const res = await fetch(`${API}/orders/${orderId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.data || data);

        // Fetch delivery tracking data if the order is active
        try {
          const delRes = await fetch(`${API}/tracking/deliveries/order/${orderId}`);
          if (delRes.ok) {
            const delData = await delRes.json();
            setDeliveryData(delData);
          }
        } catch (e) {
          console.warn('Could not fetch delivery data:', e);
        }
      } else {
        setError('Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.');
      }
      checkReview(orderId);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const checkReview = async (orderId) => {
    try {
      const [reviewRes, productReviewRes] = await Promise.all([
        fetch(`${API}/reviews/order/${orderId}`),
        fetch(`${API}/reviews/product-reviews/order/${orderId}`)
      ]);
      if (reviewRes.ok) {
        const text = await reviewRes.text();
        if (text) {
          const data = JSON.parse(text);
          if (productReviewRes.ok) {
            const pText = await productReviewRes.text();
            if (pText) {
              data.productReviews = JSON.parse(pText);
            }
          }
          setExistingReview(data);
          setHasReviewed(true);
        }
      }
    } catch (err) {
      console.warn('Could not check review status', err);
    }
  };

  if (loading) {
    return (
      <AccountSidebarLayout activeTab="orders">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AccountSidebarLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountSidebarLayout activeTab="orders">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Oops!</h2>
            <p className="text-gray-500 mb-6">{error || 'Không tìm thấy đơn hàng'}</p>
            <button 
              onClick={() => router.push('/orders')}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </AccountSidebarLayout>
    );
  }

  return (
    <AccountSidebarLayout activeTab="orders">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/orders')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition text-gray-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
          Chi tiết đơn hàng
        </h2>
      </div>

      <div className="space-y-4">
        {/* Status Banner */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-3" />
          <h2 className="text-xl font-black text-gray-900 mb-1">
            Đặt hàng thành công!
          </h2>
          <p className="text-gray-500 text-sm">
            Mã đơn: <span className="font-bold text-gray-900">{order.orderCode}</span>
          </p>
        </div>

        {/* Status Tracker with Kanban Animation */}
        <div className="bg-gradient-to-br from-white via-amber-50/20 to-white rounded-2xl p-5 shadow-sm border border-amber-200/70">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm md:text-base">
              <Truck className="w-5 h-5 text-amber-600" />
              Lộ trình xử lý đơn hàng (Kanban)
            </h3>
            {['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'DELIVERING'].includes(order.orderStatus) && (
              <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold animate-pulse flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                Đang xử lý trực tiếp
              </span>
            )}
          </div>

          {/* 4 Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                step: 1,
                name: '1. Tiếp nhận',
                sub: 'Đã nhận đơn',
                desc: 'Hệ thống đã nhận và chuyển đơn sang quán.',
                icon: Clock,
              },
              {
                step: 2,
                name: '2. Nấu món',
                sub: 'Bếp chuẩn bị',
                desc: 'Nhà hàng đang nấu và đóng gói món cẩn thận.',
                icon: Package,
              },
              {
                step: 3,
                name: '3. Đang giao',
                sub: 'Shipper di chuyển',
                desc: 'Tài xế đã nhận món và đang giao đến bạn.',
                icon: Truck,
              },
              {
                step: 4,
                name: '4. Thành công',
                sub: 'Giao tận tay',
                desc: 'Giao hàng thành công. Chúc bạn ngon miệng!',
                icon: CheckCircle2,
              },
            ].map((st) => {
              const getStage = (status) => {
                if (status === 'PLACED') return 1;
                if (['CONFIRMED', 'PREPARING', 'COOKING'].includes(status)) return 2;
                if (['READY_FOR_PICKUP', 'ASSIGNED', 'PICKED_UP', 'DELIVERING', 'ON_THE_WAY'].includes(status)) return 3;
                if (['DELIVERED', 'COMPLETED'].includes(status)) return 4;
                return 1;
              };
              const currentStep = getStage(order.orderStatus);
              const isCompleted = currentStep > st.step;
              const isCurrent = currentStep === st.step && order.orderStatus !== 'CANCELLED';
              const Icon = st.icon;

              return (
                <div
                  key={st.step}
                  className={`p-3.5 rounded-xl border text-xs transition-all relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white border-2 border-amber-400 ring-2 ring-amber-400/20 shadow-md scale-[1.01]'
                      : isCompleted
                      ? 'bg-white border-emerald-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                        {st.name}
                      </span>
                      {isCompleted ? (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          ✓ Xong
                        </span>
                      ) : isCurrent ? (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold text-[10px] animate-pulse">
                          Đang xử lý
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Chờ</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{st.desc}</p>
                  </div>
                  {isCurrent && (
                    <div className="mt-2.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse w-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vị trí Shipper (hiện khi đang lấy hàng hoặc đang giao) */}
        {order.orderStatus !== 'CANCELLED' && ['PREPARING', 'READY_FOR_PICKUP', 'ASSIGNED', 'DELIVERING'].includes(order.orderStatus) && deliveryData?.shipperId && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Định vị vị trí giao hàng
            </h3>
            <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 shadow-sm">
              <ShipperTrackingMap
                shipperId={deliveryData.shipperId}
                pickupLocation={{ lat: deliveryData.pickupLat || 10.7769, lng: deliveryData.pickupLng || 106.7009 }}
                deliveryLocation={{ lat: deliveryData.deliveryLat || 10.7800, lng: deliveryData.deliveryLng || 106.7050 }}
              />
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Thông tin giao hàng
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 leading-relaxed">
              {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : (order.deliveryAddress?.fullAddress || order.deliveryAddress?.addressLine || 'Không có địa chỉ')}
            </p>
            {order.deliveryAddress?.note && (
              <p className="text-gray-500 italic mt-2">
                Ghi chú: {order.deliveryAddress.note}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-red-600" />
            Danh sách món ăn
          </h3>
          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.itemImage ? (
                    <img src={item.itemImage} alt={item.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 text-sm">{item.itemName}</p>
                    <p className="font-bold text-gray-900 text-sm ml-4">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice || (item.unitPrice * item.quantity))}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                  </p>
                  {item.selectedOptions && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {typeof item.selectedOptions === 'string' 
                        ? item.selectedOptions 
                        : Array.isArray(item.selectedOptions) 
                          ? item.selectedOptions.map(opt => `${opt.groupName}: ${opt.optionName}`).join(', ')
                          : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí giao hàng</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.deliveryFee || 0)}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Khuyến mãi</span>
                <span className="font-medium">
                  -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discountAmount)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-3">
              <span className="font-bold text-gray-900">Tổng thanh toán</span>
              <span className="font-black text-xl text-red-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
              </span>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-xl flex items-center gap-3 border border-yellow-100">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black flex-shrink-0">
                $
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt' : 'Thanh toán online'}
                </p>
                <p className="text-xs text-gray-600">
                  Vui lòng thanh toán cho tài xế khi nhận hàng
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nút Đánh giá hoặc Hiển thị Đánh giá */}
        {(order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED') && (
          <div className="mt-6 flex flex-col items-center pb-6">
            {!hasReviewed ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold shadow hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <Star className="w-5 h-5" /> Đánh giá đơn hàng
              </button>
            ) : existingReview && (
              <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Cảm ơn bạn đã đánh giá!</h4>
                <p className="text-sm text-gray-500 mb-4 text-center">Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ tốt hơn mỗi ngày.</p>
                <div className="w-full space-y-3 text-left bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Cửa hàng:</span>
                    <div className="flex text-yellow-400">
                      {[...Array(existingReview.shopRating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                  </div>
                  {existingReview.shopComment && <p className="text-sm text-gray-600 ml-4 italic">"{existingReview.shopComment}"</p>}
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-semibold text-gray-700">Shipper:</span>
                    <div className="flex text-yellow-400">
                      {[...Array(existingReview.shipperRating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                  </div>
                  {existingReview.shipperComment && <p className="text-sm text-gray-600 ml-4 italic">"{existingReview.shipperComment}"</p>}
                  
                  {existingReview.productReviews && existingReview.productReviews.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-900 mb-2 block">Món ăn:</span>
                      <div className="space-y-3">
                        {existingReview.productReviews.map(pr => {
                          const item = order.items?.find(i => i.itemId === pr.productId);
                          return (
                            <div key={pr.id} className="bg-white p-3 rounded-lg border border-gray-100">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-gray-800">{item ? item.itemName : 'Sản phẩm'}</span>
                                <div className="flex text-yellow-400">
                                  {[...Array(pr.rating || 5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                </div>
                              </div>
                              {pr.comment && <p className="text-sm text-gray-600 italic">"{pr.comment}"</p>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Modal Đánh giá */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 pt-10 pb-10 overflow-hidden">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              Đánh giá Đơn hàng #{order.id}
            </h3>

            {/* Đánh giá Cửa hàng */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-2 text-sm">Chất lượng Cửa hàng</h4>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={`shop-${s}`} 
                    className={`w-8 h-8 cursor-pointer transition-colors ${reviewForm.shopRating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                    onClick={() => setReviewForm(prev => ({ ...prev, shopRating: s }))}
                  />
                ))}
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500"
                placeholder="Nhận xét về cửa hàng (tuỳ chọn)..."
                rows={2}
                value={reviewForm.shopComment}
                onChange={e => setReviewForm(prev => ({ ...prev, shopComment: e.target.value }))}
              />
            </div>

            {/* Đánh giá Shipper */}
            {deliveryData?.shipperId && (
              <div className="mb-6 border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-2 text-sm">Tài xế giao hàng</h4>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={`shipper-${s}`} 
                      className={`w-8 h-8 cursor-pointer transition-colors ${reviewForm.shipperRating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                      onClick={() => setReviewForm(prev => ({ ...prev, shipperRating: s }))}
                    />
                  ))}
                </div>
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Nhận xét về tài xế (tuỳ chọn)..."
                  rows={2}
                  value={reviewForm.shipperComment}
                  onChange={e => setReviewForm(prev => ({ ...prev, shipperComment: e.target.value }))}
                />
              </div>
            )}

            {/* Đánh giá Món ăn */}
            <div className="mb-6 border-t pt-4">
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Đánh giá Món ăn</h4>
              {order.items?.map(item => {
                const pReview = reviewForm.productReviews.find(pr => pr.productId === item.itemId) || { rating: 5, comment: '' };
                return (
                  <div key={item.id} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-semibold text-sm text-gray-800 mb-2">{item.itemName}</p>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star 
                          key={`prod-${item.id}-${s}`} 
                          className={`w-6 h-6 cursor-pointer ${pReview.rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          onClick={() => {
                            const newPrs = [...reviewForm.productReviews];
                            const idx = newPrs.findIndex(pr => pr.productId === item.itemId);
                            if (idx >= 0) newPrs[idx].rating = s;
                            else newPrs.push({ productId: item.itemId, rating: s, comment: '' });
                            setReviewForm(prev => ({ ...prev, productReviews: newPrs }));
                          }}
                        />
                      ))}
                    </div>
                    <textarea
                      className="w-full border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-red-500"
                      placeholder="Nhận xét món này..."
                      rows={1}
                      value={pReview.comment}
                      onChange={e => {
                        const newPrs = [...reviewForm.productReviews];
                        const idx = newPrs.findIndex(pr => pr.productId === item.itemId);
                        if (idx >= 0) newPrs[idx].comment = e.target.value;
                        else newPrs.push({ productId: item.itemId, rating: 5, comment: e.target.value });
                        setReviewForm(prev => ({ ...prev, productReviews: newPrs }));
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  try {
                    setIsSubmittingReview(true);
                    let token = localStorage.getItem('fooddelivery_access_token');
                    let userId = null;
                    let guestId = localStorage.getItem('befood_guest_session_id');
                    try { userId = JSON.parse(localStorage.getItem('fooddelivery_user'))?.id; } catch (e) {}

                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;
                    if (userId) headers['X-User-Id'] = userId;
                    else if (guestId) headers['X-Guest-Session-Id'] = guestId;

                    const payload = {
                      orderId: order.id,
                      shopRating: reviewForm.shopRating,
                      shopComment: reviewForm.shopComment,
                      shipperRating: reviewForm.shipperRating,
                      shipperComment: reviewForm.shipperComment,
                      productReviews: order.items?.map(item => ({
                        productId: item.itemId,
                        rating: reviewForm.productReviews.find(pr => pr.productId === item.itemId)?.rating || 5,
                        comment: reviewForm.productReviews.find(pr => pr.productId === item.itemId)?.comment || ''
                      })) || []
                    };

                    const res = await fetch(`${API}/reviews`, {
                      method: 'POST',
                      headers,
                      body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                      setHasReviewed(true);
                      setShowReviewModal(false);
                      checkReview(order.id);
                    } else {
                      alert('Có lỗi xảy ra khi gửi đánh giá');
                    }
                  } catch (err) {
                    alert('Lỗi kết nối');
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                disabled={isSubmittingReview}
                className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountSidebarLayout>
  );
}
