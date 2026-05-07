export type WorldId =
    | 'privacy'
    | 'misinformation'
    | 'phishing'
    | 'cyberbullying'
    | 'footprint'
    | 'algorithm';

export interface World {
    id: WorldId;
    name: string;
    tagline: string;
    emoji: string;
    /** CSS gradient string for the atmospheric background */
    gradient: string;
    /** Hex accent used for buttons, highlights, dots */
    accent: string;
    levelIds: string[];
}

// ─── Mock social media post ───────────────────────────────────────────────────

export interface MockPost {
    username: string;
    handle: string;
    avatar: string;      // emoji
    content: string;
    time: string;
    likes: number;
    reposts: number;
    verified?: boolean;
    link?: string;
    linkPreview?: string;
    comments?: MockComment[];
}

export interface MockComment {
    username: string;
    text: string;
}

// ─── Challenge types ──────────────────────────────────────────────────────────

export interface ChoiceOption {
    id: string;
    text: string;
    correct: boolean;
    outcome: string;       // what the duck says after this choice
}

export interface ChoiceChallenge {
    type: 'choice';
    situation: string;     // narrative context shown in the scene
    post?: MockPost;       // optional post to show in scene
    options: ChoiceOption[];
}

// ─────────────────────────────────────────────────────────────────────────────

export interface SwipeItem {
    id: string;
    post: MockPost;
    isReal: boolean;       // true = swipe RIGHT; false = swipe LEFT
    explanation: string;
}

export interface SwipeChallenge {
    type: 'swipe';
    instruction: string;
    labelRight: string;    // e.g. "REAL" / "SAFE" / "FINE"
    labelLeft: string;     // e.g. "FAKE" / "SKETCHY" / "RISKY"
    items: SwipeItem[];
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ConfigSetting {
    id: string;
    label: string;
    description: string;
    value: boolean;          // current (wrong) state shown to player
    correctValue: boolean;
    explanation: string;
}

export interface ConfigureChallenge {
    type: 'configure';
    context: string;
    platform: string;
    settings: ConfigSetting[];
}

// ─────────────────────────────────────────────────────────────────────────────

export type Challenge = ChoiceChallenge | SwipeChallenge | ConfigureChallenge;

export interface DialogLine {
    text: string;
}

export interface Level {
    id: string;
    worldId: WorldId;
    number: number;
    title: string;
    subtitle: string;
    intro: DialogLine[];
    challenge: Challenge;
    lesson: string;
    successMessage: string;
}
