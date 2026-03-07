export const SITE = {
  name: 'Mascoteach',
  tagline: 'Trợ giảng AI cho lớp học thế hệ mới',
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
    title: 'Mascot AI cá nhân hóa',
    description:
      'Mỗi lớp sở hữu một mascot riêng  hiểu tính cách học sinh, phản hồi bằng giọng nói và biểu cảm theo real-time.',
    lottie: '/lottie/mascot-ai.json',
    bgColor: 'bg-surface-blue',
    span: 'md:col-span-2',
  },
  {
    id: 'quiz-game',
    badge: 'Gamification',
    badgeColor: 'violet',
    title: 'Quiz & Mini-game',
    description: 'Biến bài kiểm tra thành trò chơi. Bảng xếp hạng, huy hiệu, streak  học mà như chơi.',
    lottie: '/lottie/quiz-game.json',
    bgColor: 'bg-surface-violet',
    span: 'md:col-span-1',
  },
  {
    id: 'analytics',
    badge: 'Analytics',
    badgeColor: 'teal',
    title: 'Phân tích hành vi học tập',
    description: 'Dashboard trực quan cho giáo viên: mức độ tập trung, tiến bộ từng học sinh, đề xuất cải thiện.',
    lottie: '/lottie/analytics.json',
    bgColor: 'bg-surface-teal',
    span: 'md:col-span-1',
  },
  {
    id: 'hardware',
    badge: 'Hardware',
    badgeColor: 'orange',
    title: 'Phần cứng thông minh tích hợp',
    description:
      'Nút bấm trả lời, đèn LED tương tác, micro thu âm  biến ban học thành bệ phóng sáng tạo.',
    lottie: '/lottie/hardware.json',
    bgColor: 'bg-surface-amber',
    span: 'md:col-span-2',
  },
];

export const SHOWCASE_ITEMS = [
  {
    id: 'lesson-builder',
    badge: 'Content Studio',
    badgeColor: 'sky',
    title: 'Xây bài giảng trong 5 phút',
    description:
      'Kéo-thả slide, nhúng video, quiz tự động  AI gợi ý nội dung phù hợp từng khối lớp.',
    visual: 'lesson-builder',
    features: [
      'Thư viện 10.000+ mẫu bài giảng',
      'AI tự tạo câu hỏi từ nội dung slide',
      'Chia sẻ và clone bài giảng giữa giáo viên',
    ],
  },
  {
    id: 'live-class',
    badge: 'Live Interaction',
    badgeColor: 'violet',
    title: 'Lớp học trực tiếp đầy sống động',
    description:
      'Mascot AI dẫn dắt bài học, học sinh tương tác bằng thiết bị vật lý, giáo viên kiểm soát mọi thứ từ dashboard.',
    visual: 'live-class',
    features: [
      'Phản hồi tức thì qua nút bấm IoT',
      'Mascot điều chỉnh giọng theo mood lớp',
      'Hỗ trợ hybrid: tại lớp + online đồng thời',
    ],
  },
  {
    id: 'hardware-ecosystem',
    badge: 'Smart Hardware',
    badgeColor: 'orange',
    title: 'Hệ sinh thái phần cứng đồng bộ',
    description:
      'Thiết bị plug-and-play cho mỗi bàn học. Kết nối Bluetooth, không cần IT  giáo viên tự lắp đặt trong 10 phút.',
    visual: 'hardware',
    features: [
      'Nút trả lời ABCD có LED phản hồi',
      'Micro thu âm nhận diện giọng nói',
      'Hub trung tâm quản lý toàn bộ thiết bị',
    ],
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    quote: 'Mascoteach đã thay đổi hoàn toàn cách tôi dạy. Học sinh hào hứng hơn, và tôi tiết kiệm 2 giờ soạn bài mỗi ngày.',
    name: 'Cô Nguyễn Thị Minh',
    role: 'Giáo viên Toán  THCS Nguyễn Du',
    avatar: '/images/avatar-1.jpg',
  },
  {
    id: 2,
    quote: 'Con tôi mỗi ngày đi học đều hỏi "Hôm nay Masco có trò gì mới không?"  điều mà trước đây tôi không bao giờ tưởng tượng được.',
    name: 'Anh Trần Đức Long',
    role: 'Phụ huynh, lớp 5A  iSchool Nha Trang',
    avatar: '/images/avatar-2.jpg',
  },
  {
    id: 3,
    quote: 'Phần cứng plug-and-play thật sự dễ dùng. Tôi tự lắp cho 30 bàn trong 1 buổi sáng mà không cần IT.',
    name: 'Thầy Lê Hoàng Phúc',
    role: 'Giáo viên Vật Lý  THPT Chuyên Lê Quý Đôn',
    avatar: '/images/avatar-3.jpg',
  },
  {
    id: 4,
    quote: 'Dashboard phân tích giúp tôi nhận ra những học sinh im lặng nhưng cần hỗ trợ  điều mà trước đây tôi bỏ lỡ.',
    name: 'Cô Phạm Thu Hà',
    role: 'Giáo viên Ngữ Văn  VinSchool Central Park',
    avatar: '/images/avatar-4.jpg',
  },
  {
    id: 5,
    quote: 'ROI rõ ràng: điểm trung bình lớp tăng 15% sau 1 học kỳ, và tỉ lệ học sinh tham gia tăng gấp đôi.',
    name: 'Ông Nguyễn Văn Bình',
    role: 'Hiệu trưởng  Trường Tiểu học Ánh Sao',
    avatar: '/images/avatar-5.jpg',
  },
  {
    id: 6,
    quote: 'Chúng tôi triển khai cho 12 trường và thấy sự đồng bộ tuyệt vời giữa phần mềm và phần cứng.',
    name: 'Bà Trần Thanh Tuyền',
    role: 'Giám đốc Công nghệ  FPT Education',
    avatar: '/images/avatar-6.jpg',
  },
];

export const CTA = {
  headline: 'Sẵn sàng biến lớp học của bạn thành sân khấu?',
  subheadline: 'Đăng ký ngay để trải nghiệm miễn phí 30 ngày  không cần thẻ tín dụng.',
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
  copyright: 'Mascoteach 2024. Sản phẩm của tình yêu giáo dục.',
};
