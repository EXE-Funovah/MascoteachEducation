export const SITE = {
  name: 'Mascoteach',
  tagline: 'Học vui hơn, nhớ lâu hơn',
  description:
    'Mascoteach giúp giáo viên biến tài liệu học tập thành câu hỏi, trò chơi và hoạt động tương tác cho lớp học.',
};

export const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Cách hoạt động', href: '/#how-it-works' },
  { label: 'Dành cho ai', href: '/#targeting' },
  { label: 'Bảng giá', href: '/pricing' },
];

export const HERO = {
  badge: 'Ra mắt phiên bản Beta',
  headline: ['Biến mọi lớp học', 'thành sân khấu', 'tương tác sống động'],
  subheadline:
    'Mascoteach giúp giáo viên biến tài liệu, giáo án và slide thành câu hỏi, quiz, mini game và hoạt động tương tác cho lớp học.',
  cta_primary: 'Đăng ký trải nghiệm miễn phí',
  cta_secondary: 'Xem thử 3 phút',
  visual_caption: 'Giao diện quản lý lớp học Mascoteach',
};

export const TARGET_PERSONA = {
  eyebrow: 'Dành cho ai?',
  title:
    'Mascoteach dành cho những lớp học cần tương tác nhanh, dễ hiểu và không lệch khỏi bài học chính.',
  subtitle:
    'Từ phỏng vấn và khảo sát người dùng, Mascoteach tập trung vào hai nhóm chính: giáo viên cần tạo hoạt động học tập nhanh từ tài liệu có sẵn, và học sinh cần một cách học trực quan, vừa đủ vui để tham gia nhưng vẫn quay lại đúng kiến thức.',
  personas: [
    {
      id: 'teacher-nhung',
      name: 'Cô Nhung',
      role: 'Giáo viên Sinh học THPT',
      initials: 'TN',
    image: '/images/persona-teacher-nhung.webp',
      quote: '“Một trò chơi hay nhưng vượt quá 45 phút thì rất dễ cháy giáo án.”',
      tags: ['Giáo viên sinh học'],
      painpoints: [
        'Hoạt động tương tác kéo dài dễ làm thiếu nội dung chính.',
        'Soạn game hoặc câu hỏi chất lượng tốn nhiều thời gian chuẩn bị.',
      ],
      needs: [
        'Tạo trò chơi ngắn từ giáo án trong dưới 1 phút.',
        'Có thể kiểm duyệt nội dung trước khi dùng trong lớp.',
      ],
      scenario:
        'Cô Nhung tải giáo án lên Mascoteach, chọn dạng hoạt động ngắn và xem lại câu hỏi trước tiết học. Khi lớp bắt đầu lệch nhịp, cô dùng Sumadi để kéo học sinh quay lại phần kiến thức chính.',
    },
    {
      id: 'student-minh',
      name: 'Minh, lớp 7',
      role: 'Học sinh cần được kéo lại bài học',
    image: '/images/persona-vietnamese-student.webp',
      quote:
        '“Em thích học có tương tác, nhưng nếu chỉ chơi game thì em dễ quên mình đang học gì.”',
      tags: ['Xao nhãng'],
      painpoints: [
        'Khó tập trung khi bài học nhiều lý thuyết.',
        'Ngại hỏi khi chưa hiểu vì sợ làm chậm cả lớp.',
      ],
      needs: [
        'Có hình ảnh, nhân vật và phản hồi ngắn để dễ hiểu hơn.',
        'Hoạt động ngắn, có phản hồi tức thì.',
      ],
      scenario:
        'Khi Minh trả lời sai hoặc dừng quá lâu ở một câu hỏi, Mascoteach gợi ý lại bằng hình ảnh ngắn và phản hồi thân thiện từ Sumadi, giúp em quay về đúng phần kiến thức đang học.',
    },
  ],
};

export const CTA = {
  headline: 'Biến bài học thành trải nghiệm tương tác cùng Mascoteach',
  subheadline:
    'Tạo câu hỏi, quiz và trò chơi học tập từ tài liệu có sẵn. Giúp giáo viên giữ nhịp lớp học, còn học sinh học vui hơn mà vẫn bám sát kiến thức.',
  cta_primary: 'Bắt đầu miễn phí',
  cta_secondary: 'Đặt lịch xem thử',
};

export const FOOTER = {
  columns: [
    {
      title: 'Khám phá',
      links: [
        { label: 'Cách hoạt động', href: '/#how-it-works' },
        { label: 'Dành cho ai', href: '/#targeting' },
        { label: 'Bảng giá', href: '/pricing' },
      ],
    },
    {
      title: 'Bắt đầu',
      links: [
        { label: 'Đăng ký giáo viên', href: '/register' },
        { label: 'Đăng nhập', href: '/signin' },
        { label: 'Tham gia phòng', href: '/play' },
      ],
    },
  ],
  copyright:
    'Mascoteach 2026. Sản phẩm của đội ngũ xây dựng giải pháp giáo dục tương tác.',
};
