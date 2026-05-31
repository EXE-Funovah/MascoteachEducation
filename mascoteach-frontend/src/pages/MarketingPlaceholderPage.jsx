import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const pageCopy = {
  product: {
    title: 'Trang sản phẩm',
    description: 'Mascoteach biến tài liệu học tập thành hoạt động tương tác cho lớp học.',
  },
  features: {
    title: 'Trang tính năng',
    description: 'Khám phá các tính năng tạo câu hỏi, quiz, mini game và hoạt động tương tác.',
  },
};

export default function MarketingPlaceholderPage({ type }) {
  const content = pageCopy[type] ?? pageCopy.product;

  return (
    <div className="min-h-screen bg-surface font-sans antialiased">
      <Header />
      <main className="mx-auto flex min-h-[62vh] max-w-5xl flex-col justify-center px-6 pb-20 pt-32">
        <p className="text-sm font-semibold text-sky-500">Mascoteach</p>
        <h1 className="mt-4 text-4xl font-bold tracking-normal text-ink md:text-5xl">
          {content.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-ink/62 md:text-lg">
          {content.description}
        </p>
      </main>
      <Footer />
    </div>
  );
}
