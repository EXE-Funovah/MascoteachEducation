export const SITE = {
  name: 'Mascoteach',
  tagline: 'Learn, play, lead the way',
  description: 'Biến mọi phòng học thành không gian tương tác sống động.',
};

export const NAV_LINKS = [
  { label: 'Tính năng', href: '#features' },
  { label: 'Giải pháp', href: '#showcase' },
  { label: 'Bảng giá', href: '/pricing' },
  { label: 'Đánh giá', href: '#testimonials' },
];

export const HERO = {
  badge: 'Ra mắt phiên bản Beta',
  headline: ['Biến mọi lớp học', 'thành sân khấu', 'tương tác sống động'],
  subheadline:
    'Mascoteach kết hợp mascot AI thông minh, phần cứng lớp học và bài giảng tương tác để giáo viên dạy ít hơn nhưng truyền cảm hứng nhiều hơn.',
  cta_primary: 'Đăng ký trải nghiệm miễn phí',
  cta_secondary: 'Xem demo 3 phút',
  visual_caption: 'Giao diện quản lý lớp học Mascoteach',
};

export const LOGOS = [
  { name: 'PMP', src: '/images/PMP_Logo.png' },
  { name: 'FPT University', src: '/images/FPTU_Logo.png' },
  { name: 'NSG', src: '/images/NSG_Logo.png' },
];

export const FEATURES = [
  {
    id: 'mascot-ai',
    badge: 'AI Core',
    badgeColor: 'sky',
    title: 'Trợ giảng AI — hiểu từng học sinh',
    description:
      'Mascot AI đồng hành cùng giáo viên: nhận diện cảm xúc lớp, phản hồi bằng giọng nói real-time và cá nhân hóa tương tác cho từng học sinh.',
    lottie: '/lottie/mascot-ai.json',
    bgColor: 'bg-surface-blue',
    span: 'md:col-span-2',
  },
  {
    id: 'quiz-game',
    badge: 'Gamification',
    badgeColor: 'violet',
    title: 'Học mà chơi, chơi mà nhớ',
    description: 'Biến kiểm tra khô khan thành cuộc đua hấp dẫn. Bảng xếp hạng, huy hiệu, chuỗi streak — học sinh hào hứng, giáo viên an tâm.',
    lottie: '/lottie/quiz-game.json',
    bgColor: 'bg-surface-violet',
    span: 'md:col-span-1',
  },
  {
    id: 'analytics',
    badge: 'Analytics',
    badgeColor: 'teal',
    title: 'Nhìn thấu lớp học bằng dữ liệu',
    description: 'Dashboard trực quan giúp phát hiện học sinh cần hỗ trợ, theo dõi tiến bộ từng học sinh và đưa ra quyết định giảng dạy chính xác hơn.',
    lottie: '/lottie/analytics.json',
    bgColor: 'bg-surface-teal',
    span: 'md:col-span-1',
  },
];

export const SHOWCASE_ITEMS = [
  {
    id: 'lesson-builder',
    badge: 'Content Studio',
    badgeColor: 'sky',
    title: 'Từ ý tưởng đến bài giảng — chỉ 5 phút',
    description:
      'Không còn mất hàng giờ soạn giáo án. Kéo-thả slide, nhúng video, AI tự gợi ý câu hỏi — để giáo viên dành thời gian cho điều quan trọng nhất: truyền cảm hứng.',
    visual: 'lesson-builder',
    features: [
      'Thư viện 10.000+ mẫu bài giảng sẵn dùng',
      'AI tự tạo câu hỏi quiz từ nội dung slide',
      'Chia sẻ và nhân bản bài giảng một cú click',
    ],
  },
  {
    id: 'live-class',
    badge: 'Live Interaction',
    badgeColor: 'violet',
    title: 'Lớp học sống động — nơi mọi học sinh đều được lắng nghe',
    description:
      'Mascot AI dẫn dắt, học sinh tương tác real-time, giáo viên kiểm soát toàn bộ từ dashboard. Không học sinh nào bị bỏ lại phía sau.',
    visual: 'live-class',
    features: [
      'Phản hồi tức thì — biết ngay ai đang theo kịp',
      'Mascot tự điều chỉnh năng lượng theo mood lớp',
      'Hỗ trợ dạy hybrid: tại lớp + online cùng lúc',
    ],
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    quote: 'Mascoteach đã thay đổi hoàn toàn cách tôi dạy. Học sinh hào hứng hơn, và tôi tiết kiệm 2 giờ soạn bài mỗi ngày.',
    name: 'Cô Mai Lan Anh',
    role: 'Giáo viên Toán · THCS Hoa Sen',
  },
  {
    id: 2,
    quote: 'Con tôi mỗi ngày đi học đều hỏi "Hôm nay Masco có trò gì mới không?" — điều mà trước đây tôi không bao giờ tưởng tượng được.',
    name: 'Anh Minh Khoa',
    role: 'Phụ huynh, lớp 5A · Tiểu học Bình Minh',
  },
  {
    id: 3,
    quote: 'Phần cứng plug-and-play thật sự dễ dùng. Tôi tự lắp cho 30 bàn trong 1 buổi sáng mà không cần IT.',
    name: 'Thầy Quốc Bảo',
    role: 'Giáo viên Vật Lý · THPT Thiên Long',
  },
  {
    id: 4,
    quote: 'Dashboard phân tích giúp tôi nhận ra những học sinh im lặng nhưng cần hỗ trợ — điều mà trước đây tôi bỏ lỡ.',
    name: 'Cô Hồng Nhung',
    role: 'Giáo viên Ngữ Văn · THCS Phú Lợi',
  },
  {
    id: 5,
    quote: 'ROI rõ ràng: điểm trung bình lớp tăng 15% sau 1 học kỳ, và tỉ lệ học sinh tham gia tăng gấp đôi.',
    name: 'Ông Gia Huy',
    role: 'Hiệu trưởng · Tiểu học Ngôi Sao',
  },
  {
    id: 6,
    quote: 'Chúng tôi triển khai cho 12 trường và thấy sự đồng bộ tuyệt vời giữa phần mềm và phần cứng.',
    name: 'Bà Thanh Vân',
    role: 'Giám đốc Công nghệ · EduTech Việt Nam',
  },
];

export const CTA = {
  headline: 'Sẵn sàng biến lớp học của bạn thành sân khấu?',
  subheadline: 'Đăng ký ngay để trải nghiệm miễn phí 14 ngày  không cần thẻ tín dụng.',
  cta_primary: 'Bắt đầu miễn phí',
  cta_secondary: 'Đặt lịch demo',
};

export const FOOTER = {
  columns: [
    {
      title: 'Sản phẩm',
      links: [
        { label: 'Tính năng', href: '#features' },
        { label: 'Bảng giá', href: '#pricing' },
        { label: 'Phần cứng', href: '#showcase' },
        { label: 'Roadmap', href: '#' },
      ],
    },
    {
      title: 'Tài nguyên',
      links: [
        { label: 'Tài liệu hướng dẫn', href: '#' },
        { label: 'Blog giáo dục', href: '#' },
        { label: 'Case studies', href: '#' },
        { label: 'API Docs', href: '#' },
      ],
    },
    {
      title: 'Công ty',
      links: [
        { label: 'Về chúng tôi', href: '#' },
        { label: 'Tuyển dụng', href: '#' },
        { label: 'Liên hệ', href: '#' },
        { label: 'Đối tác', href: '#' },
      ],
    },
  ],
  copyright: 'Mascoteach 2026. Sản phẩm của tình yêu công nghệ và giáo dục.',
};


