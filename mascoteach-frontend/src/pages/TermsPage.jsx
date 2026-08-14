import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Terms"
      title="Điều khoản sử dụng Mascoteach"
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
      </div>
    </LegalPageLayout>
  );
}
