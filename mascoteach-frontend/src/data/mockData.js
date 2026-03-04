// ═══════════════════════════════════════════════
// MASCOTEACH — Centralized Mock Data
// All placeholder data lives here for easy swap to API later
// ═══════════════════════════════════════════════

// ── Dashboard Stats ──
export const dashboardStats = [
    { id: 'sessions', label: 'Total Sessions', value: '142', change: '+12%', trend: 'up', icon: 'Gamepad2' },
    { id: 'accuracy', label: 'Avg Accuracy', value: '78%', change: '+5%', trend: 'up', icon: 'Target' },
    { id: 'engagement', label: 'Student Engagement', value: '91%', change: '+3%', trend: 'up', icon: 'Users' },
    { id: 'ai-usage', label: 'AI Usage Count', value: '56', change: '+18%', trend: 'up', icon: 'Sparkles' },
];

// ── Recent Games ──
export const recentGames = [
    { id: 1, title: 'Biology Chapter 5 Quiz', mode: 'Quiz Battle', players: 28, date: '2026-03-04', avgScore: 82, status: 'completed' },
    { id: 2, title: 'Math Speed Drill', mode: 'Speed Rush', players: 32, date: '2026-03-03', avgScore: 74, status: 'completed' },
    { id: 3, title: 'History Final Review', mode: 'Team Arena', players: 24, date: '2026-03-02', avgScore: 88, status: 'completed' },
    { id: 4, title: 'English Vocabulary', mode: 'Treasure Mode', players: 30, date: '2026-03-01', avgScore: 79, status: 'completed' },
    { id: 5, title: 'Physics Forces Unit', mode: 'Survival Mode', players: 26, date: '2026-02-28', avgScore: 71, status: 'completed' },
];

// ── Question Sets ──
export const questionSets = [
    { id: 1, title: 'Biology Chapter 5', questionCount: 20, createdAt: '2026-03-04', source: 'AI Generated', subject: 'Biology' },
    { id: 2, title: 'Math Speed Drill', questionCount: 15, createdAt: '2026-03-03', source: 'Manual', subject: 'Mathematics' },
    { id: 3, title: 'History Final Review', questionCount: 30, createdAt: '2026-03-02', source: 'AI Generated', subject: 'History' },
    { id: 4, title: 'English Vocabulary', questionCount: 25, createdAt: '2026-03-01', source: 'AI Generated', subject: 'English' },
    { id: 5, title: 'Physics Forces', questionCount: 18, createdAt: '2026-02-28', source: 'Manual', subject: 'Physics' },
];

// ── Game Modes ──
export const gameModes = [
    {
        id: 'quiz-battle',
        name: 'Quiz Battle',
        description: 'Classic head-to-head quiz competition. Answer questions faster than your opponents to climb the leaderboard.',
        playStyle: 'Individual',
        duration: '10-15 min',
        icon: 'Swords',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        players: '2-40',
    },
    {
        id: 'speed-rush',
        name: 'Speed Rush',
        description: 'Race against the clock! Answer as many questions as you can before time runs out.',
        playStyle: 'Individual',
        duration: '5-8 min',
        icon: 'Zap',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        players: '1-40',
    },
    {
        id: 'team-arena',
        name: 'Team Arena',
        description: 'Form teams and collaborate to answer questions. Strategy and teamwork win the game.',
        playStyle: 'Team',
        duration: '15-20 min',
        icon: 'Shield',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        players: '4-40',
    },
    {
        id: 'treasure-mode',
        name: 'Treasure Mode',
        description: 'Collect treasures by answering correctly. Use special items to boost your score or sabotage others.',
        playStyle: 'Strategy',
        duration: '12-18 min',
        icon: 'Gem',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        players: '2-40',
    },
    {
        id: 'survival-mode',
        name: 'Survival Mode',
        description: 'Get it wrong and lose a life. Last player standing wins. High stakes, high rewards.',
        playStyle: 'Individual',
        duration: '10-15 min',
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
        question: 'What is the powerhouse of the cell?',
        type: 'multiple-choice',
        difficulty: 'easy',
        options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi Apparatus'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 2,
        question: 'Which organelle is responsible for protein synthesis?',
        type: 'multiple-choice',
        difficulty: 'medium',
        options: ['Ribosome', 'Lysosome', 'Mitochondria', 'Vacuole'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 3,
        question: 'What is the function of the cell membrane?',
        type: 'multiple-choice',
        difficulty: 'easy',
        options: ['Controls what enters/exits the cell', 'Produces energy', 'Stores DNA', 'Digests waste'],
        correctAnswer: 0,
        approved: false,
    },
    {
        id: 4,
        question: 'DNA replication occurs during which phase of the cell cycle?',
        type: 'multiple-choice',
        difficulty: 'hard',
        options: ['S phase', 'G1 phase', 'G2 phase', 'M phase'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 5,
        question: 'Which type of transport requires energy?',
        type: 'multiple-choice',
        difficulty: 'medium',
        options: ['Active transport', 'Osmosis', 'Diffusion', 'Facilitated diffusion'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 6,
        question: 'What is the role of chloroplasts in plant cells?',
        type: 'multiple-choice',
        difficulty: 'easy',
        options: ['Photosynthesis', 'Cellular respiration', 'Protein synthesis', 'Cell division'],
        correctAnswer: 0,
        approved: true,
    },
    {
        id: 7,
        question: 'Which structure is found in plant cells but NOT in animal cells?',
        type: 'multiple-choice',
        difficulty: 'medium',
        options: ['Cell wall', 'Cell membrane', 'Nucleus', 'Mitochondria'],
        correctAnswer: 0,
        approved: false,
    },
    {
        id: 8,
        question: 'What is apoptosis?',
        type: 'multiple-choice',
        difficulty: 'hard',
        options: ['Programmed cell death', 'Cell growth', 'Cell division', 'Cell differentiation'],
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
    question: 'What is the powerhouse of the cell?',
    options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi Apparatus'],
    correctAnswer: 0,
    timeLimit: 20,
    answeredCount: 10,
    totalPlayers: 12,
};

// ── Student Game State ──
export const studentGameState = {
    question: 'Which organelle is responsible for protein synthesis?',
    options: ['Ribosome', 'Lysosome', 'Mitochondria', 'Vacuole'],
    timeLeft: 15,
    timeTotal: 20,
    score: 450,
    streak: 3,
    questionNumber: 5,
    totalQuestions: 20,
};

// ── Mascot Messages ──
export const mascotMessages = [
    { id: 1, type: 'encouragement', text: "You're on fire! 🔥 Keep that streak going!", mood: 'excited' },
    { id: 2, type: 'hint', text: 'Think about where energy production happens in cells...', mood: 'thinking' },
    { id: 3, type: 'celebration', text: '🎉 Correct! That was a tough one!', mood: 'celebrating' },
    { id: 4, type: 'support', text: "Don't worry, you'll get the next one! Stay focused.", mood: 'supportive' },
    { id: 5, type: 'greeting', text: 'Hey there! Ready to learn something awesome today? 📚', mood: 'idle' },
];

// ── Sessions History ──
export const sessionsHistory = [
    { id: 1, title: 'Biology Chapter 5 Quiz', mode: 'Quiz Battle', date: '2026-03-04', players: 28, avgScore: 82, duration: '14 min', status: 'completed' },
    { id: 2, title: 'Math Speed Drill', mode: 'Speed Rush', date: '2026-03-03', players: 32, avgScore: 74, duration: '7 min', status: 'completed' },
    { id: 3, title: 'History Final Review', mode: 'Team Arena', date: '2026-03-02', players: 24, avgScore: 88, duration: '18 min', status: 'completed' },
    { id: 4, title: 'English Vocabulary', mode: 'Treasure Mode', date: '2026-03-01', players: 30, avgScore: 79, duration: '15 min', status: 'completed' },
    { id: 5, title: 'Physics Forces Unit', mode: 'Survival Mode', date: '2026-02-28', players: 26, avgScore: 71, duration: '12 min', status: 'completed' },
    { id: 6, title: 'Chemistry Bonds', mode: 'Quiz Battle', date: '2026-02-27', players: 22, avgScore: 85, duration: '13 min', status: 'completed' },
    { id: 7, title: 'Geography Capitals', mode: 'Speed Rush', date: '2026-02-26', players: 35, avgScore: 90, duration: '6 min', status: 'completed' },
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
    { day: 'Mon', minutes: 42 },
    { day: 'Tue', minutes: 58 },
    { day: 'Wed', minutes: 35 },
    { day: 'Thu', minutes: 67 },
    { day: 'Fri', minutes: 51 },
    { day: 'Sat', minutes: 12 },
    { day: 'Sun', minutes: 8 },
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

// ── Teacher Profile ──
export const teacherProfile = {
    name: 'Ms. Johnson',
    email: 'johnson@school.edu',
    avatar: '👩‍🏫',
    school: 'Lincoln High School',
    subject: 'Biology',
    plan: 'Pro',
};
