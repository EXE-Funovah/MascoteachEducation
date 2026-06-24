import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Terms"
      title="Điều khoản sử dụng Mascoteach"
      summary="Trang điều khoản hiện đã có route công khai để tránh liên kết chết từ footer và ứng dụng. Nội dung pháp lý chi tiết có thể được cập nhật tiếp ngay trên route này khi team hoàn thiện file chính thức."
    >
      <div className="space-y-5 text-base leading-8 text-slate-700 md:text-[1.05rem]">
        <p>
          Nội dung điều khoản sử dụng đang được hoàn thiện. Trong thời gian chờ bản chính thức, vui lòng liên hệ{' '}
          <a
            href="mailto:support@mascoteach.com"
            className="font-semibold text-[#2B7AB5] underline decoration-[#A8D8EA] underline-offset-4 transition-colors hover:text-[#173154]"
          >
            support@mascoteach.com
          </a>{' '}
          nếu bạn cần hỗ trợ về quyền truy cập, thanh toán, hoặc dữ liệu tài khoản.
        </p>
        <p>
          Khi có bản điều khoản đầy đủ, đội ngũ có thể thay nội dung trang này mà không cần đổi URL, nên liên kết ở footer và trong app vẫn giữ ổn định tại <span className="font-semibold text-slate-900">/terms</span>.
        </p>
      </div>
    </LegalPageLayout>
  );
}
