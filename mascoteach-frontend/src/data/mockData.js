// ═══════════════════════════════════════════════
// MASCOTEACH — Centralized Mock Data (Vietnamese)
// All placeholder data lives here for easy swap to API later
// ═══════════════════════════════════════════════

// ── Teacher Profile ──
export const teacherProfile = {
    name: 'Cô Johnson',
    email: 'johnson@school.edu',
    avatar: '👩‍🏫',
    school: 'Trường THCS Nguyễn Du',
    subject: 'Sinh học',
    plan: 'Pro',
};

// ── Dashboard Stats ──
export const dashboardStats = [
    { id: 'sessions', label: 'Tổng phiên học', value: '142', change: '+12%', trend: 'up', icon: 'Gamepad2' },
    { id: 'accuracy', label: 'Độ chính xác TB', value: '78%', change: '+5%', trend: 'up', icon: 'Target' },
    { id: 'engagement', label: 'Tương tác HS', value: '91%', change: '+3%', trend: 'up', icon: 'Users' },
    { id: 'ai-usage', label: 'Sử dụng AI', value: '56', change: '+18%', trend: 'up', icon: 'Sparkles' },
];

// ── Recent Activities (for Home page) ──
export const recentActivities = [
    { id: 1, title: 'Quiz Sinh học Chương 5', action: 'đã chơi', mode: 'Trận chiến Câu hỏi', players: 28, date: '2026-03-05', time: '14:30' },
    { id: 2, title: 'Bài kiểm tra Toán nhanh', action: 'đã tạo', mode: 'Chạy đua Thời gian', players: null, date: '2026-03-05', time: '10:15' },
    { id: 3, title: 'Ôn tập Lịch sử cuối kỳ', action: 'đã chơi', mode: 'Đấu trường Đội', players: 24, date: '2026-03-04', time: '09:00' },
    { id: 4, title: 'Từ vựng Tiếng Anh', action: 'đã chỉnh sửa', mode: 'Chế độ Kho báu', players: null, date: '2026-03-03', time: '16:45' },
];

// ── Recent Games ──
export const recentGames = [
    { id: 1, title: 'Quiz Sinh học Chương 5', mode: 'Trận chiến Câu hỏi', players: 28, date: '2026-03-04', avgScore: 82, status: 'completed' },
    { id: 2, title: 'Bài kiểm tra Toán nhanh', mode: 'Chạy đua Thời gian', players: 32, date: '2026-03-03', avgScore: 74, status: 'completed' },
    { id: 3, title: 'Ôn tập Lịch sử cuối kỳ', mode: 'Đấu trường Đội', players: 24, date: '2026-03-02', avgScore: 88, status: 'completed' },
    { id: 4, title: 'Từ vựng Tiếng Anh', mode: 'Chế độ Kho báu', players: 30, date: '2026-03-01', avgScore: 79, status: 'completed' },
    { id: 5, title: 'Lực trong Vật lý', mode: 'Chế độ Sinh tồn', players: 26, date: '2026-02-28', avgScore: 71, status: 'completed' },
];

// ── Library Resources ──
export const libraryResources = {
    created: [
        { id: 1, title: 'Quiz Sinh học Chương 5', questionCount: 20, grade: 'Lớp 8', createdAt: '2026-03-04', source: 'AI', status: 'published' },
        { id: 2, title: 'Bài kiểm tra Toán nhanh', questionCount: 15, grade: 'Lớp 9', createdAt: '2026-03-03', source: 'Thủ công', status: 'published' },
        { id: 3, title: 'Ôn tập Lịch sử cuối kỳ', questionCount: 30, grade: 'Lớp 8', createdAt: '2026-03-02', source: 'AI', status: 'published' },
        { id: 4, title: 'Từ vựng Tiếng Anh', questionCount: 25, grade: 'Lớp 7', createdAt: '2026-03-01', source: 'AI', status: 'published' },
        { id: 5, title: 'Lực trong Vật lý', questionCount: 18, grade: 'Lớp 9', createdAt: '2026-02-28', source: 'Thủ công', status: 'published' },
    ],
    drafts: [
        { id: 101, title: 'Hóa học - Liên kết', questionCount: 8, grade: 'Lớp 9', createdAt: '2026-03-05', source: 'AI', status: 'draft' },
        { id: 102, title: 'Địa lý - Thủ đô', questionCount: 12, grade: 'Lớp 7', createdAt: '2026-03-04', source: 'Thủ công', status: 'draft' },
    ],
};

// ── Question Sets ──
export const questionSets = [
    { id: 1, title: 'Sinh học Chương 5', questionCount: 20, createdAt: '2026-03-04', source: 'AI', subject: 'Sinh học' },
    { id: 2, title: 'Bài kiểm tra Toán nhanh', questionCount: 15, createdAt: '2026-03-03', source: 'Thủ công', subject: 'Toán học' },
    { id: 3, title: 'Ôn tập Lịch sử cuối kỳ', questionCount: 30, createdAt: '2026-03-02', source: 'AI', subject: 'Lịch sử' },
    { id: 4, title: 'Từ vựng Tiếng Anh', questionCount: 25, createdAt: '2026-03-01', source: 'AI', subject: 'Tiếng Anh' },
    { id: 5, title: 'Lực trong Vật lý', questionCount: 18, createdAt: '2026-02-28', source: 'Thủ công', subject: 'Vật lý' },
];

// ── Game Modes (Vietnamese) ──
export const gameModes = [
    {
        id: 'quiz-battle',
        name: 'Trận chiến Câu hỏi',
        description: 'Thi đấu trắc nghiệm đối kháng kinh điển. Trả lời nhanh hơn đối thủ để leo bảng xếp hạng.',
        playStyle: 'Cá nhân',
        duration: '10-15 phút',
        icon: 'Swords',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        players: '2-40',
    },
    {
        id: 'speed-rush',
        name: 'Chạy đua Thời gian',
        description: 'Chạy đua với đồng hồ! Trả lời nhiều câu hỏi nhất trước khi hết thời gian.',
        playStyle: 'Cá nhân',
        duration: '5-8 phút',
        icon: 'Zap',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        players: '1-40',
    },
    {
        id: 'team-arena',
        name: 'Đấu trường Đội',
        description: 'Lập đội và hợp tác trả lời câu hỏi. Chiến thuật và tinh thần đồng đội quyết định chiến thắng.',
        playStyle: 'Nhóm',
        duration: '15-20 phút',
        icon: 'Shield',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        players: '4-40',
    },
    {
        id: 'treasure-mode',
        name: 'Chế độ Kho báu',
        description: 'Thu thập kho báu khi trả lời đúng. Dùng vật phẩm đặc biệt để tăng điểm hoặc cản trở đối thủ.',
        playStyle: 'Chiến thuật',
        duration: '12-18 phút',
        icon: 'Gem',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        players: '2-40',
    },
    {
        id: 'survival-mode',
        name: 'Chế độ Sinh tồn',
        description: 'Trả lời sai mất mạng. Người cuối cùng đứng vững sẽ chiến thắng.',
        playStyle: 'Cá nhân',
        duration: '10-15 phút',
        icon: 'Heart',
        color: 'from-rose-500 to-pink-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        players: '2-40',
    },
];

// ── AI-Generated Questions (mock output) ──
export const generatedQuestions = [
    {
        id: 1,
        question: 'Nhà máy năng lượng của tế bào là gì?',
        type: 'multiple-choice',
        difficulty: 'easy',
        options: ['Ti thể', 'Nhân tế bào', 'Ribosome', 'Bộ máy Golgi'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 2,
        question: 'Bào quan nào chịu trách nhiệm tổng hợp protein?',
        type: 'multiple-choice',
        difficulty: 'medium',
        options: ['Ribosome', 'Lysosome', 'Ti thể', 'Không bào'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 3,
        question: 'Chức năng của màng tế bào là gì?',
        type: 'multiple-choice',
        difficulty: 'easy',
        options: ['Kiểm soát chất ra vào tế bào', 'Sản xuất năng lượng', 'Lưu trữ DNA', 'Tiêu hóa chất thải'],
        correctAnswer: 0,
        approved: false,
    },
    {
        id: 4,
        question: 'Sao chép DNA xảy ra ở pha nào của chu kỳ tế bào?',
        type: 'multiple-choice',
        difficulty: 'hard',
        options: ['Pha S', 'Pha G1', 'Pha G2', 'Pha M'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 5,
        question: 'Loại vận chuyển nào cần năng lượng?',
        type: 'multiple-choice',
        difficulty: 'medium',
        options: ['Vận chuyển chủ động', 'Thẩm thấu', 'Khuếch tán', 'Khuếch tán có hỗ trợ'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 6,
        question: 'Vai trò của lục lạp trong tế bào thực vật là gì?',
        type: 'multiple-choice',
        difficulty: 'easy',
        options: ['Quang hợp', 'Hô hấp tế bào', 'Tổng hợp protein', 'Phân chia tế bào'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 7,
        question: 'Cấu trúc nào có trong tế bào thực vật mà KHÔNG có trong tế bào động vật?',
        type: 'multiple-choice',
        difficulty: 'medium',
        options: ['Thành tế bào', 'Màng tế bào', 'Nhân tế bào', 'Ti thể'],
        correctAnswer: 0,
        approved: false,
    },
    {
        id: 8,
        question: 'Apoptosis là gì?',
        type: 'multiple-choice',
        difficulty: 'hard',
        options: ['Chết tế bào theo chương trình', 'Sự phát triển tế bào', 'Phân chia tế bào', 'Biệt hóa tế bào'],
        correctAnswer: 0,
        approved: true,
    },
];

// ── Host Game — Players ──
export const hostPlayers = [
    { id: 1, name: 'Alex T.', score: 850, streak: 4, avatar: '🦊' },
    { id: 2, name: 'Sarah K.', score: 780, streak: 3, avatar: '🐱' },
    { id: 3, name: 'James L.', score: 720, streak: 2, avatar: '🐶' },
    { id: 4, name: 'Emma W.', score: 690, streak: 5, avatar: '🦋' },
    { id: 5, name: 'David M.', score: 650, streak: 1, avatar: '🐻' },
    { id: 6, name: 'Sophia R.', score: 620, streak: 0, avatar: '🦄' },
    { id: 7, name: 'Liam H.', score: 580, streak: 2, avatar: '🐯' },
    { id: 8, name: 'Olivia P.', score: 540, streak: 1, avatar: '🐼' },
    { id: 9, name: 'Noah C.', score: 510, streak: 3, avatar: '🦁' },
    { id: 10, name: 'Ava B.', score: 480, streak: 0, avatar: '🐰' },
    { id: 11, name: 'Mason D.', score: 450, streak: 1, avatar: '🐸' },
    { id: 12, name: 'Isabella F.', score: 420, streak: 2, avatar: '🦉' },
];

// ── Current question for host ──
export const currentHostQuestion = {
    number: 5,
    total: 20,
    question: 'Nhà máy năng lượng của tế bào là gì?',
    options: ['Ti thể', 'Nhân tế bào', 'Ribosome', 'Bộ máy Golgi'],
    correctAnswer: 0,
    timeLimit: 20,
    answeredCount: 10,
    totalPlayers: 12,
};

// ── Student Game State ──
export const studentGameState = {
    question: 'Bào quan nào chịu trách nhiệm tổng hợp protein?',
    options: ['Ribosome', 'Lysosome', 'Ti thể', 'Không bào'],
    timeLeft: 15,
    timeTotal: 20,
    score: 450,
    streak: 3,
    questionNumber: 5,
    totalQuestions: 20,
};

// ── Mascot Messages ──
export const mascotMessages = [
    { id: 1, type: 'encouragement', text: 'Bạn đang cháy! 🔥 Giữ chuỗi thắng nhé!', mood: 'excited' },
    { id: 2, type: 'hint', text: 'Hãy nghĩ về nơi sản xuất năng lượng trong tế bào...', mood: 'thinking' },
    { id: 3, type: 'celebration', text: '🎉 Chính xác! Câu đó khó đấy!', mood: 'celebrating' },
    { id: 4, type: 'support', text: 'Đừng lo, câu sau sẽ đúng thôi! Tập trung nhé.', mood: 'supportive' },
    { id: 5, type: 'greeting', text: 'Chào bạn! Sẵn sàng học điều thú vị hôm nay chưa? 📚', mood: 'idle' },
];

// ── Sessions History (Vietnamese) ──
export const sessionsHistory = [
    { id: 1, title: 'Quiz Sinh học Chương 5', mode: 'Trận chiến Câu hỏi', date: '2026-03-04', players: 28, avgScore: 82, duration: '14 phút', status: 'completed' },
    { id: 2, title: 'Bài kiểm tra Toán nhanh', mode: 'Chạy đua Thời gian', date: '2026-03-03', players: 32, avgScore: 74, duration: '7 phút', status: 'completed' },
    { id: 3, title: 'Ôn tập Lịch sử cuối kỳ', mode: 'Đấu trường Đội', date: '2026-03-02', players: 24, avgScore: 88, duration: '18 phút', status: 'completed' },
    { id: 4, title: 'Từ vựng Tiếng Anh', mode: 'Chế độ Kho báu', date: '2026-03-01', players: 30, avgScore: 79, duration: '15 phút', status: 'completed' },
    { id: 5, title: 'Lực trong Vật lý', mode: 'Chế độ Sinh tồn', date: '2026-02-28', players: 26, avgScore: 71, duration: '12 phút', status: 'completed' },
    { id: 6, title: 'Hóa học - Liên kết', mode: 'Trận chiến Câu hỏi', date: '2026-02-27', players: 22, avgScore: 85, duration: '13 phút', status: 'completed' },
    { id: 7, title: 'Địa lý - Thủ đô', mode: 'Chạy đua Thời gian', date: '2026-02-26', players: 35, avgScore: 90, duration: '6 phút', status: 'completed' },
];

// ── Analytics Data ──
export const accuracyByQuestion = [
    { question: 'Q1', accuracy: 92 },
    { question: 'Q2', accuracy: 85 },
    { question: 'Q3', accuracy: 78 },
    { question: 'Q4', accuracy: 64 },
    { question: 'Q5', accuracy: 88 },
    { question: 'Q6', accuracy: 71 },
    { question: 'Q7', accuracy: 55 },
    { question: 'Q8', accuracy: 82 },
    { question: 'Q9', accuracy: 90 },
    { question: 'Q10', accuracy: 67 },
];

export const studentRankings = [
    { rank: 1, name: 'Alex T.', avgScore: 92, gamesPlayed: 12, badge: '🏆' },
    { rank: 2, name: 'Sarah K.', avgScore: 88, gamesPlayed: 11, badge: '🥈' },
    { rank: 3, name: 'James L.', avgScore: 85, gamesPlayed: 10, badge: '🥉' },
    { rank: 4, name: 'Emma W.', avgScore: 82, gamesPlayed: 12, badge: '' },
    { rank: 5, name: 'David M.', avgScore: 79, gamesPlayed: 9, badge: '' },
    { rank: 6, name: 'Sophia R.', avgScore: 76, gamesPlayed: 11, badge: '' },
    { rank: 7, name: 'Liam H.', avgScore: 74, gamesPlayed: 8, badge: '' },
    { rank: 8, name: 'Olivia P.', avgScore: 71, gamesPlayed: 10, badge: '' },
];

export const engagementData = [
    { day: 'T2', minutes: 42 },
    { day: 'T3', minutes: 58 },
    { day: 'T4', minutes: 35 },
    { day: 'T5', minutes: 67 },
    { day: 'T6', minutes: 51 },
    { day: 'T7', minutes: 12 },
    { day: 'CN', minutes: 8 },
];

export const difficultyHeatmap = [
    { question: 'Q1', easy: 95, medium: 82, hard: 68 },
    { question: 'Q2', easy: 88, medium: 75, hard: 52 },
    { question: 'Q3', easy: 92, medium: 70, hard: 45 },
    { question: 'Q4', easy: 85, medium: 65, hard: 38 },
    { question: 'Q5', easy: 90, medium: 78, hard: 55 },
    { question: 'Q6', easy: 87, medium: 72, hard: 48 },
    { question: 'Q7', easy: 93, medium: 80, hard: 60 },
    { question: 'Q8', easy: 86, medium: 68, hard: 42 },
];
