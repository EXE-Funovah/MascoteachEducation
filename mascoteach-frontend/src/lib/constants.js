export const SITE = {
  name: 'Mascoteach',
  tagline: 'Học vui hơn, nhớ lâu hơn',
  description: 'Biến mọi phòng học thành không gian tương tác sống động.',
};

export const NAV_LINKS = [
  { label: 'Kết quả khảo sát', href: '#showcase' },
  { label: 'Đối tượng', href: '#targeting' },
  { label: 'Bảng giá', href: '/pricing' },
];

export const HERO = {
  badge: 'Ra mắt phiên bản Beta',
  headline: ['Biến mọi lớp học', 'thành sân khấu', 'tương tác sống động'],
  subheadline:
    'Mascoteach kết hợp người bạn học tập thông minh, bài giảng tương tác và công cụ lớp học để giáo viên nhẹ việc hơn, học sinh hào hứng hơn.',
  cta_primary: 'Đăng ký trải nghiệm miễn phí',
  cta_secondary: 'Xem thử 3 phút',
  visual_caption: 'Giao diện quản lý lớp học Mascoteach',
};

export const FEATURES = [
  {
    id: 'mascot-ai',
    badge: 'Trợ lý thông minh',
    badgeColor: 'sky',
    title: 'Trợ giảng thông minh — hiểu mạch học của lớp',
    description:
      'Mascoteach theo dõi tiến độ trong giờ học, nhận ra học sinh đang ở bước nào và gợi ý đúng lúc để lớp không bị trôi khỏi bài.',
    lottie: '/lottie/mascot-ai.json',
    bgColor: 'bg-surface-blue',
    span: 'md:col-span-2',
  },
  {
    id: 'quiz-game',
    badge: 'Học qua trò chơi',
    badgeColor: 'violet',
    title: 'Học mà chơi, chơi mà nhớ',
    description: 'Biến phần kiểm tra khô khan thành hoạt động ngắn, vui và có mục tiêu. Học sinh hào hứng, giáo viên vẫn kiểm soát được mạch bài.',
    lottie: '/lottie/quiz-game.json',
    bgColor: 'bg-surface-violet',
    span: 'md:col-span-1',
  },
  {
    id: 'analytics',
    badge: 'Theo dõi lớp học',
    badgeColor: 'teal',
    title: 'Nhìn thấu lớp học bằng dữ liệu',
    description: 'Bảng theo dõi rõ ràng giúp giáo viên biết em nào cần hỗ trợ, em nào đang tiến bộ và nên điều chỉnh bài dạy ở điểm nào.',
    lottie: '/lottie/analytics.json',
    bgColor: 'bg-surface-teal',
    span: 'md:col-span-1',
  },
];

export const SHOWCASE_INSIGHT = {
  eyebrow: 'Kết quả khảo sát người dùng',
  title: 'Mascoteach được thiết kế từ những gì giáo viên, phụ huynh và học sinh thật sự cần.',
  subtitle:
    'Kết quả khảo sát cho thấy người dùng không chỉ muốn lớp học vui hơn. Họ cần một công cụ giúp học sinh tập trung, giáo viên giảm tải và phụ huynh yên tâm rằng con đang học thật.',
  meta: [
    { value: '82%', label: 'giáo viên muốn được hỗ trợ tạo câu hỏi và trò chơi nhanh hơn' },
    { value: '84%', label: 'phụ huynh ủng hộ nếu lớp học triển khai Mascoteach' },
    { value: '70%', label: 'học sinh muốn học cùng nhân vật 2D/3D tương tác' },
  ],
  questions: [
    {
      id: 'Q1',
      title: 'Điều gì khiến lớp học mất nhịp tương tác?',
      subtitle: 'Những dấu hiệu lặp lại trong khảo sát cho thấy học sinh dễ rời khỏi bài học khi nội dung thiếu hình ảnh, khó hiểu hoặc hoạt động chưa gắn lại với kiến thức.',
      chips: [
        '50% giáo viên thấy học sinh mất tập trung sau 15 phút đầu',
        '47% giáo viên cho rằng bài học còn khô khan, thiếu minh họa sinh động',
        '47% học sinh dễ mất tập trung khi nội dung khó hiểu',
        '47% giáo viên nhận thấy hứng thú giảm khi quay lại phần lý thuyết',
      ],
    },
    {
      id: 'Q2',
      title: 'Điều gì khiến người dùng muốn sử dụng Mascoteach lâu dài?',
      subtitle: 'Mascoteach cần tạo hứng thú, nhưng đồng thời phải cho thấy tiến độ học tập rõ ràng và giúp người lớn kiểm soát được trải nghiệm của trẻ.',
      chips: [
        '82% giáo viên muốn hệ thống hỗ trợ tạo câu hỏi và trò chơi trong thời gian ngắn',
        '80% phụ huynh ưu tiên hiệu quả học tập khi chọn ứng dụng cho con',
        '79% phụ huynh lo khó kiểm soát con đang học hay dùng ứng dụng khác',
        '70% học sinh muốn tương tác với nhân vật 2D/3D trên màn hình',
      ],
    },
  ],
  insight: {
    title:
      'Mascoteach là người bạn học tập đủ vui để kéo học sinh vào bài, và đủ rõ ràng để giáo viên, phụ huynh tin tưởng.',
    body:
      'Giá trị thật không nằm ở việc thêm thật nhiều trò chơi, mà ở cách Mascoteach biến nội dung khô thành tương tác có mục tiêu, phản hồi được tiến độ và giúp người lớn thấy trẻ đang học một cách có kiểm soát.',
    pillars: [
      {
        label: 'Giá trị 1',
        title: 'Chơi để quay lại kiến thức',
        description:
          'Trò chơi cần kéo học sinh quay lại kiến thức, không dừng ở thắng-thua hay bảng điểm.',
        evidence: '50% giáo viên cho rằng học sinh dễ bị cuốn vào thắng-thua hơn là ghi nhớ bài.',
      },
      {
        label: 'Giá trị 2',
        title: 'Giảm tải cho giáo viên',
        description:
          'Giáo viên cần giảm tải soạn câu hỏi, nhập liệu và biến bài học thành hoạt động tương tác nhanh hơn.',
        evidence: '82% giáo viên bị thuyết phục bởi khả năng tạo câu hỏi và trò chơi nhanh hơn.',
      },
      {
        label: 'Giá trị 3',
        title: 'Học tập có kiểm soát',
        description:
          'Phụ huynh và giáo viên cần tín hiệu rõ rằng trẻ đang học, đang tiến bộ và không bị xao nhãng.',
        evidence: '79% phụ huynh lo khó kiểm soát việc con học hay dùng ứng dụng khác.',
      },
    ],
  },
};

export const TARGET_PERSONA = {
  eyebrow: 'Đối tượng trọng tâm',
  title:
    'Mascoteach tập trung vào giáo viên cần giữ nhịp lớp học trong thời lượng ngắn, và học sinh dễ bị kéo ra khỏi bài.',
  subtitle:
    'Từ phỏng vấn cô Nhung, nhóm người dùng đáng ưu tiên là giáo viên bộ môn cần tổ chức hoạt động nhanh, chính xác, không cháy giáo án; đi cùng là học sinh cần tương tác vừa đủ để quay lại kiến thức.',
  personas: [
    {
      id: 'teacher-nhung',
      name: 'Cô Nhung',
      role: 'Giáo viên Sinh học THPT',
      initials: 'TN',
      image: '/images/persona-teacher-nhung.jpg',
      quote:
        '“Một trò chơi hay nhưng vượt quá 45 phút thì rất dễ cháy giáo án.”',
      tags: ['Giáo viên sinh học'],
      painpoints: [
        'Hoạt động tương tác kéo dài dễ làm thiếu nội dung chính.',
        'Soạn game chất lượng tốn nhiều thời gian chuẩn bị.',
        'Học sinh ngại hỏi, giáo viên khó giải đáp từng em.',
      ],
      needs: [
        'Tạo trò chơi ngắn từ giáo án trong dưới 1 phút.',
        'Giáo viên kiểm duyệt nội dung trước giờ học.',
        'Trợ giảng theo mạch lớp học và gợi ý đúng lúc.',
      ],
      scenario:
        'Cô Nhung chuẩn bị trò chơi ngắn từ giáo án, xem lại câu hỏi trước tiết học và để Mascoteach nhắc đúng điểm khi lớp bắt đầu lệch nhịp.',
    },
    {
      id: 'student-minh',
      name: 'Minh, lớp 7',
      role: 'Học sinh cần được kéo lại bài học',
      image: '/images/persona-vietnamese-student.png',
      quote:
        '“Em thích học có tương tác, nhưng nếu chỉ chơi game thì em dễ quên mình đang học gì.”',
      tags: ['Xao nhãng'],
      painpoints: [
        'Khó tập trung khi bài học nhiều lý thuyết.',
        'Ngại hỏi khi chưa hiểu vì sợ làm chậm cả lớp.',
        'Dễ chú ý đến thắng-thua hơn nội dung bài.',
      ],
      needs: [
        'Mascoteach nhìn vào tiến độ học để giải thích lại bằng ngôn ngữ dễ hiểu.',
        'Hoạt động ngắn, có phản hồi tức thì.',
        'Học vui nhưng vẫn rõ mục tiêu bài học.',
      ],
      scenario:
        'Khi Minh trả lời sai hoặc dừng quá lâu ở một câu hỏi, Mascoteach nhìn vào tiến độ bài học, gợi ý lại bằng hình ảnh ngắn và đưa em quay về đúng phần kiến thức đang học.',
    },
  ],
};

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
    quote: 'Bảng theo dõi giúp tôi nhận ra những học sinh im lặng nhưng cần hỗ trợ — điều mà trước đây tôi bỏ lỡ.',
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
  cta_secondary: 'Đặt lịch xem thử',
};

export const FOOTER = {
  columns: [
    {
      title: 'Sản phẩm',
      links: [
        { label: 'Bảng giá', href: '#pricing' },
        { label: 'Insight khảo sát', href: '#showcase' },
        { label: 'Đối tượng mục tiêu', href: '#targeting' },
        { label: 'Roadmap', href: '#' },
      ],
    },
    {
      title: 'Tài nguyên',
      links: [
        { label: 'Tài liệu hướng dẫn', href: '#' },
        { label: 'Blog giáo dục', href: '#' },
        { label: 'Case studies', href: '#' },
        { label: 'Tài liệu kết nối', href: '#' },
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


