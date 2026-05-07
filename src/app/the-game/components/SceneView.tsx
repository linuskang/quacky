"use client";

import { useGame } from '../engine/GameContext';
import PostMockup from './PostMockup';
import type { ChoiceChallenge, SwipeChallenge, ConfigureChallenge } from '../levels/types';

// ─── Phone frame wrapper ─────────────────────────────────────────────────────

function PhoneFrame({ children, accent }: { children: React.ReactNode; accent?: string }) {
    return (
        <div
            className="relative w-[300px] rounded-[40px] overflow-hidden shadow-2xl flex-shrink-0"
            style={{
                background: '#111',
                border: `2px solid rgba(255,255,255,0.12)`,
                boxShadow: `0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
        >
            {/* Notch */}
            <div className="phone-notch" />
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-7 pb-2 bg-white">
                <span className="text-gray-500 text-[10px] font-medium">9:41</span>
                <div className="flex items-center gap-1">
                    <span className="text-gray-500 text-[10px]">●●●</span>
                    <span className="text-gray-500 text-[10px]">WiFi</span>
                    <span className="text-gray-500 text-[10px]">100%</span>
                </div>
            </div>
            {/* App bar */}
            <div
                className="px-4 py-2 flex items-center gap-2"
                style={{ background: accent ? `${accent}22` : 'rgba(255,255,255,0.95)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
                <span className="text-lg">🦆</span>
                <span className="font-bold text-gray-800 text-sm">Quacky</span>
            </div>
            {/* Scrollable content */}
            <div className="bg-gray-50 overflow-y-auto game-scroll" style={{ maxHeight: '380px' }}>
                {children}
            </div>
        </div>
    );
}

// ─── Choice scene ─────────────────────────────────────────────────────────────

function ChoiceScene({ challenge, accent }: { challenge: ChoiceChallenge; accent?: string }) {
    return (
        <PhoneFrame accent={accent}>
            {/* Situation card */}
            <div className="mx-3 mt-3 mb-2 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: accent ?? '#60a5fa', color: '#000' }}
                    >?</div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Situation</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{challenge.situation}</p>
            </div>
            {/* Post (if provided) */}
            {challenge.post && (
                <div className="mx-3 mb-3">
                    <PostMockup post={challenge.post} />
                </div>
            )}
        </PhoneFrame>
    );
}

// ─── Swipe scene ──────────────────────────────────────────────────────────────

function SwipeScene({
    challenge,
    accent,
    swipeIndex,
    swipeFeedbackVisible,
    swipeFeedbackCorrect,
    swipeFeedbackExplanation,
}: {
    challenge: SwipeChallenge;
    accent?: string;
    swipeIndex: number;
    swipeFeedbackVisible: boolean;
    swipeFeedbackCorrect: boolean;
    swipeFeedbackExplanation: string;
}) {
    const item = challenge.items[Math.min(swipeIndex, challenge.items.length - 1)];
    const total = challenge.items.length;

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Counter */}
            <div className="flex items-center gap-2">
                {challenge.items.map((_, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{
                            background: i < swipeIndex
                                ? (accent ?? '#60a5fa')
                                : i === swipeIndex
                                ? 'rgba(255,255,255,0.8)'
                                : 'rgba(255,255,255,0.2)',
                            transform: i === swipeIndex ? 'scale(1.3)' : undefined,
                        }}
                    />
                ))}
            </div>

            {/* Post card */}
            <div
                key={swipeIndex}
                className={`w-[300px] game-slide-right`}
            >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Instruction banner */}
                    <div
                        className="px-4 py-2 flex items-center gap-2"
                        style={{ background: accent ? `${accent}22` : '#f0f4ff' }}
                    >
                        <span className="text-xs text-gray-600">{challenge.instruction}</span>
                    </div>
                    <div className="p-3">
                        <PostMockup post={item.post} />
                    </div>
                </div>
            </div>

            {/* Per-card feedback */}
            {swipeFeedbackVisible && (
                <div
                    className={`w-[300px] rounded-xl p-3 text-sm leading-relaxed game-slide-up ${
                        swipeFeedbackCorrect ? 'bg-green-900/60 border border-green-500/30' : 'bg-red-900/60 border border-red-500/30'
                    }`}
                >
                    <span style={{ color: swipeFeedbackCorrect ? '#86efac' : '#fca5a5' }}>
                        {swipeFeedbackExplanation}
                    </span>
                </div>
            )}

            <div className="text-white/30 text-xs">{Math.min(swipeIndex + 1, total)} / {total}</div>
        </div>
    );
}

// ─── Configure scene ─────────────────────────────────────────────────────────

function ConfigureScene({
    challenge,
    accent,
    configValues,
    onToggle,
}: {
    challenge: ConfigureChallenge;
    accent?: string;
    configValues: Record<string, boolean>;
    onToggle: (id: string) => void;
}) {
    return (
        <PhoneFrame accent={accent}>
            <div className="px-3 py-3">
                {/* Context */}
                <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">⚙️</span>
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{challenge.platform} Settings</span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">{challenge.context}</p>
                </div>

                {/* Settings list */}
                <div className="space-y-2">
                    {challenge.settings.map(setting => {
                        const current = configValues[setting.id] ?? setting.value;
                        return (
                            <button
                                key={setting.id}
                                onClick={() => onToggle(setting.id)}
                                className="w-full bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                            >
                                {/* Toggle */}
                                <div
                                    className="relative w-10 h-6 rounded-full flex-shrink-0 transition-colors duration-200"
                                    style={{
                                        background: current
                                            ? (accent ?? '#3b82f6')
                                            : '#d1d5db',
                                    }}
                                >
                                    <div
                                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                                        style={{ transform: current ? 'translateX(18px)' : 'translateX(2px)' }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-gray-800 text-xs font-medium leading-tight">{setting.label}</div>
                                    <div className="text-gray-400 text-[10px] leading-tight mt-0.5">{setting.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </PhoneFrame>
    );
}

// ─── Intro scene ─────────────────────────────────────────────────────────────

function IntroScene({ accent }: { accent?: string }) {
    const { currentLevel, currentWorld } = useGame();
    if (!currentLevel || !currentWorld) return null;
    return (
        <div className="text-center game-fade-in">
            <div className="text-6xl mb-4">{currentWorld.emoji}</div>
            <div
                className="text-xs font-bold uppercase tracking-widest mb-2 px-3 py-1 rounded-full inline-block"
                style={{ background: accent + '22', color: accent, border: `1px solid ${accent}44` }}
            >
                {currentWorld.name}
            </div>
            <h2 className="text-white text-2xl font-bold mt-3 mb-1">{currentLevel.title}</h2>
            <p className="text-white/50 text-base">{currentLevel.subtitle}</p>
        </div>
    );
}

// ─── Feedback scene ──────────────────────────────────────────────────────────

function FeedbackScene({ accent }: { accent?: string }) {
    const { state } = useGame();
    return (
        <div className="flex flex-col items-center text-center max-w-sm game-pop-in">
            <div className="text-6xl mb-4">{state.feedbackSuccess ? '🎉' : '😅'}</div>
            <h2
                className="text-2xl font-bold mb-3"
                style={{ color: state.feedbackSuccess ? '#86efac' : '#fca5a5' }}
            >
                {state.feedbackSuccess ? 'Correct!' : 'Not quite.'}
            </h2>
            {state.feedbackExplanation && (
                <div
                    className="rounded-2xl p-4 text-sm leading-relaxed"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.8)',
                    }}
                >
                    <div className="text-xs uppercase tracking-widest mb-2" style={{ color: accent ?? '#60a5fa' }}>
                        💡 The Lesson
                    </div>
                    {state.feedbackExplanation}
                </div>
            )}
        </div>
    );
}

// ─── Complete scene ───────────────────────────────────────────────────────────

function CompleteScene({ accent }: { accent?: string }) {
    const { currentLevel } = useGame();
    return (
        <div className="flex flex-col items-center text-center max-w-sm game-pop-in">
            <div className="text-6xl mb-4 game-success-burst">⭐</div>
            <h2 className="text-white text-2xl font-bold mb-2">Level Complete!</h2>
            <p className="text-white/60 text-sm mb-4">{currentLevel?.successMessage}</p>
            {currentLevel?.lesson && (
                <div
                    className="rounded-2xl p-4 text-sm leading-relaxed text-left"
                    style={{
                        background: `${accent ?? '#60a5fa'}15`,
                        border: `1px solid ${accent ?? '#60a5fa'}33`,
                        color: 'rgba(255,255,255,0.85)',
                    }}
                >
                    <div
                        className="text-xs uppercase tracking-widest mb-2 font-bold"
                        style={{ color: accent ?? '#60a5fa' }}
                    >
                        📌 Remember
                    </div>
                    {currentLevel.lesson}
                </div>
            )}
        </div>
    );
}

// ─── Main SceneView ──────────────────────────────────────────────────────────

export default function SceneView() {
    const { state, dispatch, currentLevel, currentWorld } = useGame();
    const accent = currentWorld?.accent;

    const content = (() => {
        if (state.screen === 'intro') return <IntroScene accent={accent} />;
        if (state.screen === 'feedback') return <FeedbackScene accent={accent} />;
        if (state.screen === 'complete') return <CompleteScene accent={accent} />;

        if (!currentLevel) return null;
        const { challenge } = currentLevel;

        if (state.screen === 'playing' || state.screen === 'swipe-feedback') {
            if (challenge.type === 'choice') {
                return <ChoiceScene challenge={challenge} accent={accent} />;
            }
            if (challenge.type === 'swipe') {
                return (
                    <SwipeScene
                        challenge={challenge}
                        accent={accent}
                        swipeIndex={state.swipeIndex}
                        swipeFeedbackVisible={state.swipeFeedbackVisible}
                        swipeFeedbackCorrect={state.swipeFeedbackCorrect}
                        swipeFeedbackExplanation={state.swipeFeedbackExplanation}
                    />
                );
            }
            if (challenge.type === 'configure') {
                return (
                    <ConfigureScene
                        challenge={challenge}
                        accent={accent}
                        configValues={state.configValues}
                        onToggle={id => dispatch({ type: 'TOGGLE_CONFIG', settingId: id })}
                    />
                );
            }
        }
        return null;
    })();

    return (
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {content}
        </div>
    );
}
