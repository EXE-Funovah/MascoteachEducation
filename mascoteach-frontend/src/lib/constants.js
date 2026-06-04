export const SITE = {
  name: 'Mascoteach',
  tagline: 'Học vui hơn, nhớ lâu hơn',
  description:
    'Mascoteach giúp giáo viên biến tài liệu học tập thành câu hỏi, trò chơi và hoạt động tương tác cho lớp học.',
};

export const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/product' },
  { label: 'Tính năng', href: '/features' },
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

export const FEATURES = [
  {
    id: 'mascot-ai',
    badge: 'Trợ lý học tập',
    badgeColor: 'sky',
    title: 'Tạo hoạt động nhanh từ tài liệu có sẵn',
    description:
      'Mascoteach giúp giáo viên biến giáo án, slide hoặc nội dung bài học thành câu hỏi và trò chơi tương tác trong thời gian ngắn.',
    lottie: '/lottie/mascot-ai.json',
    bgColor: 'bg-surface-blue',
    span: 'md:col-span-2',
  },
  {
    id: 'quiz-game',
    badge: 'Học qua trò chơi',
    badgeColor: 'violet',
    title: 'Học vui nhưng vẫn bám bài',
    description:
      'Biến phần kiểm tra khô khan thành hoạt động ngắn, trực quan và có mục tiêu. Học sinh hào hứng, giáo viên vẫn giữ được mạch bài.',
    lottie: '/lottie/quiz-game.json',
    bgColor: 'bg-surface-violet',
    span: 'md:col-span-1',
  },
  {
    id: 'analytics',
    badge: 'Theo dõi lớp học',
    badgeColor: 'teal',
    title: 'Giữ nhịp lớp học bằng phản hồi rõ ràng',
    description:
      'Bảng theo dõi giúp giáo viên biết phần nào cần nhắc lại, học sinh nào cần hỗ trợ và hoạt động nào đang kéo lớp quay lại kiến thức chính.',
    lottie: '/lottie/analytics.json',
    bgColor: 'bg-surface-teal',
    span: 'md:col-span-1',
  },
];

export const SHOWCASE_INSIGHT = {
  eyebrow: 'Dữ liệu từ khảo sát người dùng',
  title: 'Mascoteach được xây dựng từ nhu cầu thật của lớp học.',
  subtitle:
    'Kết quả khảo sát người dùng cho thấy lớp học không chỉ cần vui hơn, mà còn cần hoạt động tương tác ngắn, dễ triển khai và vẫn bám sát kiến thức chính.',
  meta: [
    { value: '82%', label: 'giáo viên muốn tạo câu hỏi và trò chơi học tập nhanh hơn' },
    {
      value: '84%',
      label: 'phụ huynh ủng hộ nếu hoạt động tương tác vẫn bám sát nội dung bài học',
    },
    {
      value: '70%',
      label: 'học sinh hứng thú hơn khi bài học có nhân vật, hình ảnh hoặc trò chơi ngắn',
    },
  ],
  questions: [
    {
      id: 'Q1',
      title: 'Điều gì khiến lớp học mất nhịp tương tác?',
      subtitle:
        'Những phản hồi lặp lại cho thấy học sinh dễ rời khỏi bài học khi nội dung thiếu hình ảnh, khó hiểu hoặc hoạt động tương tác chưa gắn chặt với kiến thức chính.',
      chips: [
        '50% giáo viên nhận thấy học sinh mất tập trung sau 15 phút đầu',
        '47% giáo viên cho rằng bài học khó tạo hứng thú nếu thiếu minh họa sinh động',
        '47% học sinh dễ mất tập trung khi nội dung quá khó hiểu',
        '47% giáo viên nhận thấy hứng thú giảm khi hoạt động chỉ quay lại phần lý thuyết',
      ],
      note:
        'Vì vậy, Mascoteach tập trung vào hoạt động ngắn, trực quan và có thể tạo nhanh từ tài liệu sẵn có.',
    },
    {
      id: 'Q2',
      title: 'Điều gì khiến người dùng muốn sử dụng Mascoteach lâu dài?',
      subtitle:
        'Mascoteach cần tạo hứng thú, nhưng đồng thời phải cho thấy tiến độ học tập rõ ràng và giúp người lớn kiểm soát được trải nghiệm của trẻ.',
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
      'Mascoteach giúp lớp học đủ vui để học sinh tham gia, và đủ rõ ràng để giáo viên, phụ huynh tin tưởng.',
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
      image: '/images/persona-teacher-nhung.jpg',
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
      image: '/images/persona-vietnamese-student.png',
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
      title: 'Sản phẩm',
      links: [
        { label: 'Tính năng', href: '/features' },
        { label: 'Cách hoạt động', href: '/product' },
        { label: 'Bảng giá', href: '/pricing' },
        { label: 'Roadmap', href: '/product' },
      ],
    },
    {
      title: 'Tài liệu',
      links: [
        { label: 'Tài liệu hướng dẫn', href: '/features' },
        { label: 'Blog giáo dục', href: '/features' },
        { label: 'Case studies', href: '/product' },
        { label: 'Câu hỏi thường gặp', href: '/features' },
      ],
    },
    {
      title: 'Công ty',
      links: [
        { label: 'Về chúng tôi', href: '/product' },
        { label: 'Tuyển dụng', href: '/product' },
        { label: 'Liên hệ', href: '/product' },
        { label: 'Đối tác', href: '/product' },
      ],
    },
  ],
  copyright:
    'Mascoteach 2026. Sản phẩm của đội ngũ xây dựng giải pháp giáo dục tương tác.',
};
