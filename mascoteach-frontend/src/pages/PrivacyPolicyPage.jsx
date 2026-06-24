import LegalMarkdown from '@/components/legal/LegalMarkdown';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import privacyPolicyMarkdown from '@/content/privacy-policy.md?raw';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy"
      title="Chính sách bảo mật Mascoteach"
      summary="Trang này công khai nội dung privacy policy của Mascoteach để người dùng web, ứng dụng mobile và Google Play có thể truy cập ổn định tại một URL riêng."
    >
      <LegalMarkdown markdown={privacyPolicyMarkdown} />
    </LegalPageLayout>
  );
}
