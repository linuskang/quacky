"use client";

import { useGame } from '../engine/GameContext';
import { worlds } from '../levels/worlds';

export default function TopBar() {
    const { state, dispatch, currentLevel, currentWorld } = useGame();

    const handleBack = () => dispatch({ type: 'GO_TO_MAP' });

    // World progress dots
    const worldLevels = currentWorld
        ? worlds.find(w => w.id === currentWorld.id)?.levelIds ?? []
        : [];

    return (
        <div
            className="game-bar flex-shrink-0 flex items-center justify-between px-4 h-12 z-20"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
            {/* Left: back to map */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
            >
                <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
                <span className="hidden sm:inline">Map</span>
            </button>

            {/* Center: level info */}
            {currentLevel && currentWorld ? (
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-base">{currentWorld.emoji}</span>
                        <span className="text-white text-sm font-medium tracking-wide">
                            {currentWorld.name}
                        </span>
                        <span className="text-white/30 text-sm">·</span>
                        <span className="text-white/60 text-sm">{currentLevel.title}</span>
                    </div>
                </div>
            ) : (
                <div className="text-white/40 text-sm font-medium tracking-widest uppercase text-xs">
                    Social Media Academy
                </div>
            )}

            {/* Right: level progress dots */}
            <div className="flex items-center gap-1.5">
                {worldLevels.map((levelId, i) => {
                    const isCompleted = state.completedLevels.includes(levelId);
                    const isCurrent = levelId === state.currentLevelId;
                    return (
                        <div
                            key={levelId}
                            title={`Level ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                                isCompleted
                                    ? 'w-2.5 h-2.5'
                                    : isCurrent
                                    ? 'w-2.5 h-2.5 progress-dot-active'
                                    : 'w-2 h-2'
                            }`}
                            style={{
                                background: isCompleted
                                    ? (currentWorld?.accent ?? '#fff')
                                    : isCurrent
                                    ? (currentWorld?.accent ?? '#fff') + 'aa'
                                    : 'rgba(255,255,255,0.2)',
                                boxShadow: isCurrent
                                    ? `0 0 8px ${currentWorld?.accent ?? '#fff'}88`
                                    : undefined,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
