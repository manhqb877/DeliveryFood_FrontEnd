'use client';

export default function PolicyPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-140px)] pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 text-sm text-gray-500 w-full mb-8">
        <div className="mx-auto max-w-[1200px] flex items-center gap-1.5">
          <a href="/" className="hover:text-[var(--color-primary-dark)]">Trang chủ</a>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Chính sách đặt hàng</span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#333] mb-8 uppercase leading-tight text-center">
          CHÍNH SÁCH ĐẶT HÀNG TẠI BEFOOD
        </h1>
        
        <div className="prose prose-sm md:prose-base max-w-none text-[#333]">
          <p className="mb-4">
            Chào mừng Quý khách đến với dịch vụ đặt đồ ăn beFood của Be Group. Để đảm bảo trải nghiệm tốt nhất, vui lòng đọc kỹ các chính sách và quy định dưới đây.
          </p>

          <h3 className="text-[18px] font-bold mt-8 mb-4">1. QUY ĐỊNH CHUNG</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Khách hàng cần cung cấp đầy đủ và chính xác thông tin liên lạc (Họ tên, SĐT, Địa chỉ) để đảm bảo việc giao hàng được thực hiện đúng và nhanh chóng nhất.</li>
            <li>Đơn hàng sẽ được xác nhận qua ứng dụng hoặc website ngay sau khi quá trình đặt món hoàn tất.</li>
            <li>beFood có quyền từ chối phục vụ hoặc hủy đơn hàng đối với các trường hợp thông tin không hợp lệ, không thể liên lạc với khách hàng hoặc có dấu hiệu gian lận.</li>
          </ul>

          <h3 className="text-[18px] font-bold mt-8 mb-4">2. CHÍNH SÁCH GIAO HÀNG & PHÍ VẬN CHUYỂN</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Thời gian giao hàng:</strong> Thời gian dự kiến sẽ được hiển thị trên hệ thống tại thời điểm đặt hàng, tùy thuộc vào khoảng cách và tình trạng giao thông.</li>
            <li><strong>Phí giao hàng:</strong> Phí sẽ được tính dựa trên quãng đường từ cửa hàng đến địa chỉ nhận. Phí giao hàng sẽ được thông báo rõ ràng trước khi thanh toán.</li>
            <li>Trong các trường hợp bất khả kháng (thời tiết xấu, thiên tai, dịch bệnh...), thời gian giao hàng có thể lâu hơn dự kiến.</li>
          </ul>

          <h3 className="text-[18px] font-bold mt-8 mb-4">3. CHÍNH SÁCH HỦY ĐƠN VÀ HOÀN TIỀN</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li><strong>Hủy đơn hàng:</strong> Khách hàng chỉ có thể hủy đơn hàng khi trạng thái đơn hàng là "Đã đặt hàng". Không thể hủy khi đơn hàng đã chuyển sang trạng thái "Đang chuẩn bị" hoặc "Đang giao".</li>
            <li><strong>Hoàn tiền:</strong> Đối với đơn hàng thanh toán trước (Thẻ/Ví điện tử) bị hủy hợp lệ, tiền sẽ được hoàn lại tài khoản của quý khách trong vòng 3-5 ngày làm việc tùy thuộc vào quy định của ngân hàng phát hành thẻ.</li>
            <li>Trong trường hợp nhận sai món hoặc món ăn có vấn đề về chất lượng, quý khách vui lòng liên hệ ngay hotline 1900 23 23 45 trong vòng 30 phút kể từ lúc nhận hàng để được giải quyết đổi trả hoặc bồi thường.</li>
          </ul>

          <h3 className="text-[18px] font-bold mt-8 mb-4">4. PHƯƠNG THỨC THANH TOÁN</h3>
          <p className="mb-6">
            Chúng tôi hỗ trợ đa dạng các phương thức thanh toán nhằm mang lại sự tiện lợi nhất cho khách hàng:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>Thanh toán tiền mặt khi nhận hàng (COD).</li>
            <li>Thanh toán qua Ví điện tử (ZaloPay, MoMo, ShopeePay...).</li>
            <li>Thanh toán qua Thẻ tín dụng/Thẻ ghi nợ (Visa/Mastercard/JCB) và Thẻ ATM nội địa.</li>
          </ul>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-10">
            <h4 className="font-bold text-red-600 mb-2">TRUNG TÂM HỖ TRỢ KHÁCH HÀNG</h4>
            <p className="mb-1"><strong>Hotline:</strong> 1900 23 23 45 (1000đ/phút)</p>
            <p className="mb-1"><strong>Email:</strong> hotro@be.com.vn</p>
            <p><strong>Thời gian hoạt động:</strong> 24/7 (Bao gồm cả Lễ/Tết)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
