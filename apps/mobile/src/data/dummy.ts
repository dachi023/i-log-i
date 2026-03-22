import type {
  Answer,
  BotConversation,
  BotMessage,
  Entry,
  PersonTag,
  Profile,
  Question,
  User,
} from "@i-log-i/types";

// ============================================================
// ユーザー
// ============================================================

export const currentUser: User = {
  id: "01JQXK5V0G3M8N2P4R6T8W0Y1Z",
  displayName: "田中 太郎",
  email: "tanaka.taro@example.com",
  role: "recorder",
  userDbName: "user_01JQXK5V0G3M8N2P4R6T8W0Y1Z",
  status: "active",
  lastActiveAt: "2026-03-19T14:30:00.000Z",
  createdAt: "2025-06-01T09:00:00.000Z",
  updatedAt: "2026-03-19T14:30:00.000Z",
};

// ============================================================
// 記録エントリ
// ============================================================

export const entries: Entry[] = [
  {
    id: "01JR0A1B2C3D4E5F6G7H8J9K0L",
    body: "健太の卒業式。壇上で証書を受け取る姿を見て泣いた。美咲も泣いていた。帰りにファミレスで3人でお祝いした。",
    recordedAt: "2026-03-15T18:30:00.000Z",
    createdAt: "2026-03-15T18:30:00.000Z",
    updatedAt: "2026-03-15T18:30:00.000Z",
  },
  {
    id: "01JR0B2C3D4E5F6G7H8J9K0L1M",
    body: "仕事帰りに桜のつぼみが膨らんでいるのを見つけた。来週あたり咲きそう。今年は家族で花見に行きたい。",
    recordedAt: "2026-03-10T16:00:00.000Z",
    createdAt: "2026-03-10T16:00:00.000Z",
    updatedAt: "2026-03-10T16:00:00.000Z",
  },
  {
    id: "01JR0C3D4E5F6G7H8J9K0L1M2N",
    body: "新しいプロジェクトのリーダーを任された。不安もあるけど、チームを信じてやってみる。夜、美咲に話したら少し楽になった。",
    recordedAt: "2026-03-05T23:45:00.000Z",
    createdAt: "2026-03-05T23:45:00.000Z",
    updatedAt: "2026-03-05T23:45:00.000Z",
  },
  {
    id: "01JR0D4E5F6G7H8J9K0L1M2N3P",
    body: "天気がよかったので川沿いを散歩した。水面に映る空がきれいだった。",
    recordedAt: "2026-03-01T10:20:00.000Z",
    createdAt: "2026-03-01T10:20:00.000Z",
    updatedAt: "2026-03-01T10:20:00.000Z",
  },
  {
    id: "01JR0E5F6G7H8J9K0L1M2N3P4Q",
    body: "母の75歳の誕生日。肉じゃがのレシピを教えてもらった。「砂糖をちょっと多めに入れるのがコツよ」と笑っていた。",
    recordedAt: "2026-02-20T19:00:00.000Z",
    createdAt: "2026-02-20T19:00:00.000Z",
    updatedAt: "2026-02-20T19:00:00.000Z",
  },
  {
    id: "01JR0F6G7H8J9K0L1M2N3P4Q5R",
    body: "朝起きたら雪だった。帰ったら美咲がシチューを作ってくれていた。",
    recordedAt: "2026-02-05T20:00:00.000Z",
    createdAt: "2026-02-05T20:00:00.000Z",
    updatedAt: "2026-02-05T20:00:00.000Z",
  },
  {
    id: "01JR0G7H8J9K0L1M2N3P4Q5R6S",
    body: "今期のプロジェクトが無事に終わった。山田くんが本当によく頑張ってくれた。打ち上げで久しぶりにビールを飲んだ。",
    recordedAt: "2026-01-28T17:45:00.000Z",
    createdAt: "2026-01-28T17:45:00.000Z",
    updatedAt: "2026-01-28T17:45:00.000Z",
  },
  {
    id: "01JR0H8J9K0L1M2N3P4Q5R6S7T",
    body: "健太の15歳の誕生日。チョコレートケーキをみんなで食べた。もう自分より背が高い。",
    recordedAt: "2026-01-15T20:00:00.000Z",
    createdAt: "2026-01-15T20:00:00.000Z",
    updatedAt: "2026-01-15T20:00:00.000Z",
  },
  {
    id: "01JR0J9K0L1M2N3P4Q5R6S7T8U",
    body: "年末に鈴木と飲んだ。大学の頃の話で盛り上がった。変わらないなあいつは。",
    recordedAt: "2026-01-05T22:30:00.000Z",
    createdAt: "2026-01-05T22:30:00.000Z",
    updatedAt: "2026-01-05T22:30:00.000Z",
  },
  {
    id: "01JR0K0L1M2N3P4Q5R6S7T8U9V",
    body: "家族で初詣に行った。健太がおみくじで大吉を引いて喜んでいた。美咲は末吉で少し不満そうだった。",
    recordedAt: "2026-01-01T12:00:00.000Z",
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-01-01T12:00:00.000Z",
  },
];

// ============================================================
// 人物タグ
// ============================================================

export const personTags: PersonTag[] = [
  {
    id: "01JR1A1B2C3D4E5F6G7H8J9K0L",
    name: "美咲",
    relationship: "妻",
    notes: "結婚19年目。いつも支えてくれる大切な存在。",
    createdAt: "2025-06-15T10:00:00.000Z",
  },
  {
    id: "01JR1B2C3D4E5F6G7H8J9K0L1M",
    name: "健太",
    relationship: "息子",
    notes: "15歳。中学を卒業して、春から高校生。サッカー部。",
    createdAt: "2025-06-15T10:01:00.000Z",
  },
  {
    id: "01JR1C3D4E5F6G7H8J9K0L1M2N",
    name: "田中 花子",
    relationship: "母",
    notes: "75歳。一人暮らし。料理上手。",
    createdAt: "2025-06-15T10:02:00.000Z",
  },
  {
    id: "01JR1D4E5F6G7H8J9K0L1M2N3P",
    name: "鈴木 一郎",
    relationship: "友人",
    notes: "大学時代からの親友。月に一度飲みに行く仲。",
    createdAt: "2025-07-01T12:00:00.000Z",
  },
  {
    id: "01JR1E5F6G7H8J9K0L1M2N3P4Q",
    name: "山田 誠",
    relationship: "同僚",
    notes: "プロジェクトチームの後輩。頼りになる。",
    createdAt: "2025-08-10T09:00:00.000Z",
  },
  {
    id: "01JR1F6G7H8J9K0L1M2N3P4Q5R",
    name: "田中 正雄",
    relationship: "父（故人）",
    notes: "2020年に他界。花見が好きだった。",
    createdAt: "2025-06-15T10:03:00.000Z",
  },
];

// ============================================================
// 質問
// ============================================================

export const questions: Question[] = [
  // ============================================================
  // setup: オンボーディング時に3問。プロファイルの核となる情報を収集
  // → values, personality_traits, life_story
  // ============================================================
  {
    id: "01JR2A1B2C3D4E5F6G7H8J9K0L",
    category: "setup",
    subcategory: "values",
    questionText: "あなたの人生で最も大切にしている価値観は何ですか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 1,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2B2C3D4E5F6G7H8J9K0L1M",
    category: "setup",
    subcategory: "personality_traits",
    questionText: "自分の性格を一言で表すとしたら、どんな言葉を選びますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 2,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2C3D4E5F6G7H8J9K0L1M2N",
    category: "setup",
    subcategory: "life_story",
    questionText: "あなたの人生の転機となった出来事を教えてください。",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 3,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  // ============================================================
  // daily: 各プロファイルフィールドに紐付く日常質問
  // subcategoryでどのフィールドの情報を収集するか明示
  // ============================================================
  {
    id: "01JR2D4E5F6G7H8J9K0L1M2N3P",
    category: "daily",
    subcategory: "emotional_patterns",
    questionText: "最近、心が温かくなった出来事はありますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 10,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2E5F6G7H8J9K0L1M2N3P4Q",
    category: "daily",
    subcategory: "values",
    questionText: "今の仕事や活動で、一番やりがいを感じる瞬間はいつですか？",
    answerType: "select",
    options: [
      "チームで成果を出したとき",
      "誰かの役に立てたとき",
      "新しいことを学んだとき",
      "自分の成長を感じたとき",
      "その他",
    ],
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 11,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F6G7H8J9K0L1M2N3P4Q5R",
    category: "daily",
    subcategory: "emotional_patterns",
    questionText: "ストレスを感じたとき、どうやって気持ちを切り替えますか？",
    answerType: "select",
    options: [
      "散歩や運動をする",
      "誰かに話を聞いてもらう",
      "好きなことに没頭する",
      "ゆっくり休む",
      "その他",
    ],
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 12,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F1A2B3C4D5E6F7G8H9J0K",
    category: "daily",
    subcategory: "relationships",
    questionText: "今日、誰かに感謝したいことはありますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 13,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F2B3C4D5E6F7G8H9J0K1L",
    category: "daily",
    subcategory: "humor_style",
    questionText: "最近笑ったのはいつですか？何がおかしかったですか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 14,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F3C4D5E6F7G8H9J0K1L2M",
    category: "daily",
    subcategory: "relationships",
    questionText: "最近、大切な人と話したことで印象に残っていることは？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 15,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F4D5E6F7G8H9J0K1L2M3N",
    category: "daily",
    subcategory: "speech_style",
    questionText: "人に何かを伝えるとき、気をつけていることはありますか？",
    answerType: "select",
    options: [
      "わかりやすく簡潔に",
      "相手の気持ちを考える",
      "具体例を交えて",
      "ユーモアを入れる",
      "その他",
    ],
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 16,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F5E6F7G8H9J0K1L2M3N4P",
    category: "daily",
    subcategory: "emotional_patterns",
    questionText: "今の気分を天気に例えるなら、どんな天気ですか？",
    answerType: "select",
    options: ["快晴", "晴れ", "くもり", "雨", "嵐"],
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 17,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F6F7G8H9J0K1L2M3N4P5Q",
    category: "daily",
    subcategory: "personality_traits",
    questionText: "今の充実度はどのくらいですか？",
    answerType: "scale",
    options: null,
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ["あまり充実していない", "とても充実している"],
    isSystem: true,
    priority: 18,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2F7G8H9J0K1L2M3N4P5Q6R",
    category: "daily",
    subcategory: "values",
    questionText: "最近ハマっていることや、気になっていることはありますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 19,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  // ============================================================
  // scenario: 仮定の状況を通じてパーソナリティを深掘り
  // ============================================================
  {
    id: "01JR2G7H8J9K0L1M2N3P4Q5R6S",
    category: "scenario",
    subcategory: "relationships",
    questionText: "親しい友人が落ち込んでいるとき、あなたはどのように接しますか？",
    answerType: "select",
    options: [
      "まず話を聞く",
      "一緒に過ごす時間を作る",
      "アドバイスをする",
      "そっとしておく",
      "その他",
    ],
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 20,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2H8J9K0L1M2N3P4Q5R6S7T",
    category: "scenario",
    subcategory: "life_story",
    questionText: "もし人生をやり直せるとしたら、何か変えたいことはありますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 21,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2J9K0L1M2N3P4Q5R6S7T8U",
    category: "scenario",
    subcategory: "values",
    questionText: "人生で最も影響を受けた人は誰ですか？その理由も教えてください。",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 22,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2G1A2B3C4D5E6F7G8H9J0K",
    category: "scenario",
    subcategory: "humor_style",
    questionText: "場の空気が重いとき、あなたはどうしますか？",
    answerType: "select",
    options: [
      "冗談を言って和ませる",
      "話題を変える",
      "自然に任せる",
      "自分から話しかける",
      "その他",
    ],
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 23,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2G2B3C4D5E6F7G8H9J0K1L",
    category: "scenario",
    subcategory: "speech_style",
    questionText: "初対面の人と話すとき、どんな話し方を心がけますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 24,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  // ============================================================
  // supplemental: 深掘り用の補足質問
  // ============================================================
  {
    id: "01JR2K0L1M2N3P4Q5R6S7T8U9V",
    category: "supplemental",
    subcategory: "life_story",
    questionText: "子供の頃の一番の思い出は何ですか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 30,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2K1A2B3C4D5E6F7G8H9J0K",
    category: "supplemental",
    subcategory: "speech_style",
    questionText: "よく使う口癖や、つい出てしまう表現はありますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 31,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "01JR2K2B3C4D5E6F7G8H9J0K1L",
    category: "supplemental",
    subcategory: "relationships",
    questionText: "家族との間で大切にしているルールや習慣はありますか？",
    answerType: "text",
    options: null,
    scaleMin: null,
    scaleMax: null,
    scaleLabels: null,
    isSystem: true,
    priority: 32,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

// ============================================================
// 回答
// ============================================================

export const answers: Answer[] = [
  // setup回答
  {
    id: "01JR3A1B2C3D4E5F6G7H8J9K0L",
    questionId: "01JR2A1B2C3D4E5F6G7H8J9K0L",
    answerText:
      "家族との時間と信頼関係です。どんなに仕事が忙しくても、家族と過ごす時間だけは大切にしてきました。人と人との繋がりが、人生を豊かにしてくれると信じています。",
    answeredAt: "2025-07-10T20:00:00.000Z",
  },
  {
    id: "01JR3B2C3D4E5F6G7H8J9K0L1M",
    questionId: "01JR2B2C3D4E5F6G7H8J9K0L1M",
    answerText:
      "「穏やかだけど芯がある」でしょうか。普段はのんびりしていますが、大切なことに関しては譲らない頑固な面もあります。美咲にはよく「頑固」と言われますが（笑）",
    answeredAt: "2025-07-15T21:30:00.000Z",
  },
  {
    id: "01JR3C3D4E5F6G7H8J9K0L1M2N",
    questionId: "01JR2C3D4E5F6G7H8J9K0L1M2N",
    answerText:
      "父の他界が一番大きかったです。自分が何を大切にすべきか、残された時間をどう使うか、真剣に考えるようになりました。あとは健太が生まれたとき。自分より大切な存在ができるって、こういうことなんだなと。",
    answeredAt: "2025-07-20T19:45:00.000Z",
  },
  // scenario/daily回答
  {
    id: "01JR3D4E5F6G7H8J9K0L1M2N3P",
    questionId: "01JR2G7H8J9K0L1M2N3P4Q5R6S",
    answerText:
      "まずは話を聞くことを大切にします。アドバイスよりも、まず相手の気持ちに寄り添いたい。それから、もし相手が望むなら、一緒に美味しいものを食べに行きます。食事をしながら話すと、少し気が楽になるものです。",
    answeredAt: "2025-08-05T20:15:00.000Z",
  },
  {
    id: "01JR3E5F6G7H8J9K0L1M2N3P4Q",
    questionId: "01JR2J9K0L1M2N3P4Q5R6S7T8U",
    answerText:
      "父です。寡黙な人でしたが、行動で多くのことを教えてくれました。毎朝早く起きて家族のために働き、休日には必ず家族と過ごしてくれた。その背中を見て、自分も同じような父親になりたいと思いました。",
    answeredAt: "2025-08-20T21:00:00.000Z",
  },
];

// ============================================================
// プロファイル
// ============================================================

export const profile: Profile = {
  id: "01JR4A1B2C3D4E5F6G7H8J9K0L",
  version: 1,
  speechStyle: {
    tone: "穏やか・温かみのある口調",
    formality: "丁寧だがかしこまりすぎない",
    characteristics: [
      "語尾が柔らかい",
      "「〜と思います」「〜ですね」を多用",
      "時折ユーモアを交える",
      "（笑）を使う",
    ],
    fillerWords: ["そうですね", "なんというか"],
  },
  values: {
    core: ["家族", "信頼", "誠実さ"],
    secondary: ["成長", "感謝", "日常の幸せ"],
    beliefs: ["人との繋がりが人生を豊かにする", "完璧でなくても良い", "行動で示すことが大切"],
  },
  personalityTraits: {
    bigFive: {
      openness: 0.65,
      conscientiousness: 0.8,
      extraversion: 0.45,
      agreeableness: 0.85,
      neuroticism: 0.35,
    },
    summary: "穏やかで協調性が高く、責任感が強い。内向的だが人への思いやりが深い。",
  },
  humorStyle: {
    type: "温かいユーモア",
    examples: ["自虐的なジョーク", "家族のエピソードを面白おかしく語る"],
    frequency: "適度に",
  },
  emotionalPatterns: {
    stressResponse: "一人で考え込むが、最終的には妻に相談する",
    joyTriggers: ["家族の成長", "自然の美しさ", "チームの成功"],
    comfortActions: ["散歩", "読書", "妻との会話"],
  },
  relationships: {
    familyImportance: "最優先",
    communicationStyle: "聞き上手、必要な時にアドバイス",
    conflictResolution: "冷静に話し合い、相手の立場を理解しようとする",
  },
  lifeStory: {
    childhood: "田舎で育ち、自然の中で遊んだ。父の背中を見て育った。",
    turning_points: ["大学進学で上京", "美咲との出会いと結婚", "健太の誕生", "父の他界"],
    currentChapter: "家族と仕事のバランスを取りながら、人生の後半戦を意識し始めている",
  },
  confidenceScores: {
    speechStyle: 0.75,
    values: 0.85,
    personalityTraits: 0.7,
    humorStyle: 0.6,
    emotionalPatterns: 0.65,
    relationships: 0.8,
    lifeStory: 0.7,
  },
  sourceSummary: "日記10件、回答5件、音声メモ2件から生成",
  createdAt: "2026-03-01T00:00:00.000Z",
};

// ============================================================
// ボット会話
// ============================================================

export const botConversations: BotConversation[] = [
  {
    id: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    participant: "self",
    startedAt: "2026-03-18T20:00:00.000Z",
    endedAt: null,
  },
  {
    id: "01JR5C3D4E5F6G7H8J9K0L1M2N",
    participant: "self",
    startedAt: "2026-03-15T21:00:00.000Z",
    endedAt: null,
  },
  {
    id: "01JR5D4E5F6G7H8J9K0L1M2N3P",
    participant: "self",
    startedAt: "2026-03-12T18:30:00.000Z",
    endedAt: null,
  },
  {
    id: "01JR5B2C3D4E5F6G7H8J9K0L1M",
    participant: "self",
    startedAt: "2026-03-10T19:00:00.000Z",
    endedAt: "2026-03-10T19:30:00.000Z",
  },
  {
    id: "01JR5E5F6G7H8J9K0L1M2N3P4Q",
    participant: "self",
    startedAt: "2026-02-25T20:00:00.000Z",
    endedAt: "2026-02-25T20:45:00.000Z",
  },
];

// ============================================================
// ボットメッセージ
// ============================================================

export const botMessages: BotMessage[] = [
  // 会話1: 最近の気持ちについて
  {
    id: "01JR6A1B2C3D4E5F6G7H8J9K0L",
    conversationId: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    role: "user",
    content: "最近、自分の人生について考えることが増えたんだけど。",
    profileVersion: 1,
    createdAt: "2026-03-18T20:00:00.000Z",
  },
  {
    id: "01JR6B2C3D4E5F6G7H8J9K0L1M",
    conversationId: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    role: "assistant",
    content:
      "そうですね、人生について考える時間は大切ですよね。何かきっかけがあったんですか？最近の日記を見ると、健太くんの卒業式があったり、お母さんの誕生日をお祝いしたり、家族との大切な時間を過ごされていますね。",
    profileVersion: 1,
    createdAt: "2026-03-18T20:00:30.000Z",
  },
  {
    id: "01JR6C3D4E5F6G7H8J9K0L1M2N",
    conversationId: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    role: "user",
    content:
      "そうなんだ。健太が卒業して高校に行くと思うと、時間が経つのが早いなって。自分が父親になった頃のことを思い出すよ。",
    profileVersion: 1,
    createdAt: "2026-03-18T20:01:00.000Z",
  },
  {
    id: "01JR6D4E5F6G7H8J9K0L1M2N3P",
    conversationId: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    role: "assistant",
    content:
      "お気持ち、わかります。健太くんの成長を見守ってきた15年間、きっとあっという間だったでしょうね。お父様のことを大切に想われているように、健太くんもきっと太郎さんの背中を見て育っているんだと思います。「行動で示すことが大切」という太郎さんの信念は、きっと伝わっていますよ。",
    profileVersion: 1,
    createdAt: "2026-03-18T20:01:30.000Z",
  },
  {
    id: "01JR6E5F6G7H8J9K0L1M2N3P4Q",
    conversationId: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    role: "user",
    content: "ありがとう。そう言ってもらえると嬉しいな。",
    profileVersion: 1,
    createdAt: "2026-03-18T20:02:00.000Z",
  },
  {
    id: "01JR6F6G7H8J9K0L1M2N3P4Q5R",
    conversationId: "01JR5A1B2C3D4E5F6G7H8J9K0L",
    role: "assistant",
    content:
      "こちらこそ。太郎さんがこうして自分の気持ちを言葉にしてくれることが、とても嬉しいです。何か他に話したいことや、考えていることはありますか？",
    profileVersion: 1,
    createdAt: "2026-03-18T20:02:30.000Z",
  },

  // 会話2: 家族の思い出について
  {
    id: "01JR6L1A2B3C4D5E6F7G8H9J0K",
    conversationId: "01JR5C3D4E5F6G7H8J9K0L1M2N",
    role: "user",
    content: "健太の卒業式のこと、もう少し詳しく残しておきたいんだ。",
    profileVersion: 1,
    createdAt: "2026-03-15T21:00:00.000Z",
  },
  {
    id: "01JR6L2B3C4D5E6F7G8H9J0K1L",
    conversationId: "01JR5C3D4E5F6G7H8J9K0L1M2N",
    role: "assistant",
    content:
      "いいですね。卒業式、きっと特別な一日だったんでしょうね。どんな場面が一番印象に残っていますか？",
    profileVersion: 1,
    createdAt: "2026-03-15T21:00:30.000Z",
  },

  // 会話3: 趣味について
  {
    id: "01JR6M1A2B3C4D5E6F7G8H9J0K",
    conversationId: "01JR5D4E5F6G7H8J9K0L1M2N3P",
    role: "user",
    content: "最近、散歩のときに写真を撮るのにハマってるんだ。",
    profileVersion: 1,
    createdAt: "2026-03-12T18:30:00.000Z",
  },
  {
    id: "01JR6M2B3C4D5E6F7G8H9J0K1L",
    conversationId: "01JR5D4E5F6G7H8J9K0L1M2N3P",
    role: "assistant",
    content:
      "散歩と写真、素敵な組み合わせですね。太郎さんは自然の美しさに心を動かされる方ですから、きっと良い写真を撮られているんでしょうね。どんなものを撮ることが多いですか？",
    profileVersion: 1,
    createdAt: "2026-03-12T18:30:30.000Z",
  },
  {
    id: "01JR6M3C4D5E6F7G8H9J0K1L2M",
    conversationId: "01JR5D4E5F6G7H8J9K0L1M2N3P",
    role: "user",
    content: "空と川が多いかな。あと季節の花とか。何気ない風景が好きなんだよね。",
    profileVersion: 1,
    createdAt: "2026-03-12T18:31:00.000Z",
  },
  {
    id: "01JR6M4D5E6F7G8H9J0K1L2M3N",
    conversationId: "01JR5D4E5F6G7H8J9K0L1M2N3P",
    role: "assistant",
    content:
      "何気ない風景にこそ美しさがある、太郎さんらしい視点ですね。写真も日記と同じように、太郎さんの目線で世界を切り取る記録になりますね。",
    profileVersion: 1,
    createdAt: "2026-03-12T18:31:30.000Z",
  },

  // 会話4: 仕事の悩みについて
  {
    id: "01JR6G7H8J9K0L1M2N3P4Q5R6S",
    conversationId: "01JR5B2C3D4E5F6G7H8J9K0L1M",
    role: "user",
    content: "新しいプロジェクトのリーダーを任されたんだけど、ちょっと不安で。",
    profileVersion: 1,
    createdAt: "2026-03-10T19:00:00.000Z",
  },
  {
    id: "01JR6H8J9K0L1M2N3P4Q5R6S7T",
    conversationId: "01JR5B2C3D4E5F6G7H8J9K0L1M",
    role: "assistant",
    content:
      "新しいプロジェクト、おめでとうございます。不安を感じるのは自然なことですよね。でも、太郎さんは責任感が強くて、チームのことを大切にする方ですから、きっとうまくいきますよ。前のプロジェクトの振り返りでも、チームへの感謝を語っていましたよね。",
    profileVersion: 1,
    createdAt: "2026-03-10T19:00:30.000Z",
  },
  {
    id: "01JR6J9K0L1M2N3P4Q5R6S7T8U",
    conversationId: "01JR5B2C3D4E5F6G7H8J9K0L1M",
    role: "user",
    content:
      "そうだね。チームのみんなを信じて、一歩ずつやっていくしかないか。美咲にも話を聞いてもらったよ。",
    profileVersion: 1,
    createdAt: "2026-03-10T19:15:00.000Z",
  },
  {
    id: "01JR6K0L1M2N3P4Q5R6S7T8U9V",
    conversationId: "01JR5B2C3D4E5F6G7H8J9K0L1M",
    role: "assistant",
    content:
      "美咲さんに相談されたんですね。太郎さんらしいです。いつも最後は美咲さんに話を聞いてもらって、気持ちを整理されますよね。それも太郎さんの強さだと思います。一人で抱え込まない、それが大事ですよね。",
    profileVersion: 1,
    createdAt: "2026-03-10T19:15:30.000Z",
  },

  // 会話5: 母との思い出について
  {
    id: "01JR6N1A2B3C4D5E6F7G8H9J0K",
    conversationId: "01JR5E5F6G7H8J9K0L1M2N3P4Q",
    role: "user",
    content: "母の誕生日に教えてもらった肉じゃがのレシピ、ちゃんと記録しておきたいんだ。",
    profileVersion: 1,
    createdAt: "2026-02-25T20:00:00.000Z",
  },
  {
    id: "01JR6N2B3C4D5E6F7G8H9J0K1L",
    conversationId: "01JR5E5F6G7H8J9K0L1M2N3P4Q",
    role: "assistant",
    content:
      "お母さんのレシピを残しておきたいというお気持ち、とても素敵ですね。「砂糖をちょっと多めに」というコツも、お母さんらしい温かみがありますよね。他にも覚えているポイントはありますか？",
    profileVersion: 1,
    createdAt: "2026-02-25T20:00:30.000Z",
  },
  {
    id: "01JR6N3C4D5E6F7G8H9J0K1L2M",
    conversationId: "01JR5E5F6G7H8J9K0L1M2N3P4Q",
    role: "user",
    content:
      "じゃがいもは大きめに切ること、あと最後に火を止めてから味を染み込ませるのがコツだって。",
    profileVersion: 1,
    createdAt: "2026-02-25T20:10:00.000Z",
  },
  {
    id: "01JR6N4D5E6F7G8H9J0K1L2M3N",
    conversationId: "01JR5E5F6G7H8J9K0L1M2N3P4Q",
    role: "assistant",
    content:
      "ありがとうございます。こうした何気ないやりとりの中に、お母さんの優しさや知恵が詰まっていますね。太郎さんがこのレシピを大切に残してくれることで、健太くんにもいつか伝わるかもしれませんね。",
    profileVersion: 1,
    createdAt: "2026-02-25T20:10:30.000Z",
  },
];
