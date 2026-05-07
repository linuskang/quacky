"use client";

import { useGame } from '../engine/GameContext';
import type { ChoiceChallenge, SwipeChallenge } from '../levels/types';

// ─── Duck speech bubble ───────────────────────────────────────────────────────

function DuckBubble({ text }: { text: string }) {
    return (
        <div className="flex items-end gap-3 flex-1 min-w-0">
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 game-duck-bob select-none"
                style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                }}
            >
                🦆
            </div>
            {/* Bubble */}
            <div
                key={text}
                className="relative rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-white/90 leading-relaxed max-w-xs game-slide-left"
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.12)',
                }}
            >
                {text}
            </div>
        </div>
    );
}

// ─── Intro controls ───────────────────────────────────────────────────────────

function IntroControls() {
    const { state, dispatch, currentLevel, currentWorld } = useGame();
    if (!currentLevel) return null;
    const line = currentLevel.intro[state.introIndex];
    const isLast = state.introIndex === currentLevel.intro.length - 1;
    const accent = currentWorld?.accent ?? '#60a5fa';

    return (
        <div className="flex items-end gap-4 w-full">
            <DuckBubble text={line.text} />
            <button
                onClick={() => dispatch({ type: 'ADVANCE_INTRO' })}
                className="flex-shrink-0 rounded-2xl px-5 py-3 font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                style={{ background: accent, color: '#000' }}
            >
                {isLast ? "Let's go →" : "Next →"}
            </button>
        </div>
    );
}

// ─── Choice controls ──────────────────────────────────────────────────────────

function ChoiceControls({ challenge }: { challenge: ChoiceChallenge }) {
    const { state, dispatch, currentWorld } = useGame();
    const accent = currentWorld?.accent ?? '#60a5fa';

    return (
        <div className="w-full space-y-2">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-3">Choose your response</div>
            {challenge.options.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => dispatch({ type: 'CHOOSE_OPTION', optionId: opt.id })}
                    disabled={!!state.chosenOptionId}
                    className={`w-full text-left rounded-xl px-4 py-3 text-sm transition-all active:scale-[0.98] ${
                        state.chosenOptionId === opt.id
                            ? opt.correct
                                ? 'border-green-500/60 bg-green-900/40 text-green-300'
                                : 'border-red-500/60 bg-red-900/40 text-red-300'
                            : state.chosenOptionId
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-white/10 active:bg-white/15 text-white/80'
                    }`}
                    style={{
                        border: state.chosenOptionId === opt.id
                            ? undefined
                            : `1px solid rgba(255,255,255,0.12)`,
                    }}
                >
                    <span className="font-medium text-xs uppercase mr-2 opacity-50">{opt.id.toUpperCase()})</span>
                    {opt.text}
                </button>
            ))}
        </div>
    );
}

// ─── Swipe controls ───────────────────────────────────────────────────────────

function SwipeControls({ challenge }: { challenge: SwipeChallenge }) {
    const { state, dispatch, currentWorld } = useGame();
    const accent = currentWorld?.accent ?? '#60a5fa';

    if (state.swipeFeedbackVisible) {
        return (
            <div className="w-full flex items-center justify-between gap-4">
                <DuckBubble
                    text={state.swipeFeedbackCorrect ? '✓ Correct!' : '✗ Not quite — check the explanation above.'}
                />
                <button
                    onClick={() => dispatch({ type: 'SWIPE_NEXT' })}
                    className="flex-shrink-0 rounded-2xl px-5 py-3 font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                    style={{ background: accent, color: '#000' }}
                >
                    Next →
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="text-white/40 text-xs uppercase tracking-widest mb-3 text-center">
                Swipe or tap to decide
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => dispatch({ type: 'SWIPE', direction: 'left' })}
                    className="flex-1 rounded-2xl py-4 text-sm font-bold transition-all active:scale-95 hover:brightness-110 flex flex-col items-center gap-1"
                    style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#fca5a5',
                    }}
                >
                    <span className="text-xl">←</span>
                    <span>{challenge.labelLeft}</span>
                </button>
                <button
                    onClick={() => dispatch({ type: 'SWIPE', direction: 'right' })}
                    className="flex-1 rounded-2xl py-4 text-sm font-bold transition-all active:scale-95 hover:brightness-110 flex flex-col items-center gap-1"
                    style={{
                        background: 'rgba(74, 222, 128, 0.2)',
                        border: '1px solid rgba(74, 222, 128, 0.35)',
                        color: '#86efac',
                    }}
                >
                    <span className="text-xl">→</span>
                    <span>{challenge.labelRight}</span>
                </button>
            </div>
        </div>
    );
}

// ─── Configure controls ───────────────────────────────────────────────────────

function ConfigureControls() {
    const { dispatch, currentWorld } = useGame();
    const accent = currentWorld?.accent ?? '#60a5fa';

    return (
        <div className="w-full flex items-end gap-4">
            <DuckBubble text="Toggle the settings to the right values, then submit when you're ready." />
            <button
                onClick={() => dispatch({ type: 'SUBMIT_CONFIG' })}
                className="flex-shrink-0 rounded-2xl px-5 py-3 font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                style={{ background: accent, color: '#000' }}
            >
                Submit ✓
            </button>
        </div>
    );
}

// ─── Feedback controls ────────────────────────────────────────────────────────

function FeedbackControls() {
    const { state, dispatch, currentWorld } = useGame();
    const accent = currentWorld?.accent ?? '#60a5fa';

    return (
        <div className="w-full flex items-end gap-4">
            <DuckBubble text={state.feedbackMessage} />
            <button
                onClick={() => dispatch({ type: 'DISMISS_FEEDBACK' })}
                className="flex-shrink-0 rounded-2xl px-5 py-3 font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                style={{
                    background: state.feedbackSuccess ? accent : 'rgba(255,255,255,0.15)',
                    color: state.feedbackSuccess ? '#000' : '#fff',
                }}
            >
                {state.feedbackSuccess ? 'Continue →' : 'Try Again ↺'}
            </button>
        </div>
    );
}

// ─── Complete controls ────────────────────────────────────────────────────────

function CompleteControls() {
    const { state, dispatch, currentLevel, currentWorld } = useGame();
    const accent = currentWorld?.accent ?? '#60a5fa';
    if (!currentLevel || !currentWorld) return null;

    const idx = currentWorld.levelIds.indexOf(currentLevel.id);
    const hasNext = idx < currentWorld.levelIds.length - 1;

    return (
        <div className="w-full flex items-end gap-3">
            <DuckBubble text={hasNext ? "Ready for the next challenge?" : "You've cleared this world! Head back to the map to explore more."} />
            <div className="flex flex-col gap-2 flex-shrink-0">
                {hasNext && (
                    <button
                        onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
                        className="rounded-2xl px-5 py-3 font-semibold text-sm transition-all active:scale-95 hover:brightness-110"
                        style={{ background: accent, color: '#000' }}
                    >
                        Next Level →
                    </button>
                )}
                <button
                    onClick={() => dispatch({ type: 'GO_TO_MAP' })}
                    className="rounded-2xl px-5 py-3 font-semibold text-sm transition-all active:scale-95 text-white/60 hover:text-white/90"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                    ← Map
                </button>
            </div>
        </div>
    );
}

// ─── Main ControlsBar ─────────────────────────────────────────────────────────

export default function ControlsBar() {
    const { state, currentLevel } = useGame();

    const controls = (() => {
        if (state.screen === 'intro') return <IntroControls />;
        if (state.screen === 'feedback') return <FeedbackControls />;
        if (state.screen === 'complete') return <CompleteControls />;

        if (!currentLevel) return null;
        const { challenge } = currentLevel;

        if (state.screen === 'playing' || state.screen === 'swipe-feedback') {
            if (challenge.type === 'choice') return <ChoiceControls challenge={challenge} />;
            if (challenge.type === 'swipe') return <SwipeControls challenge={challenge} />;
            if (challenge.type === 'configure') return <ConfigureControls />;
        }
        return null;
    })();

    return (
        <div
            className="game-bar flex-shrink-0 px-4 py-4"
            style={{ minHeight: '120px', maxHeight: '280px', overflowY: 'auto' }}
        >
            {controls}
        </div>
    );
}
