"use client";

import { useGame } from '../engine/GameContext';
import { worlds } from '../levels/worlds';
import { levelMap } from '../levels';

export default function LevelMap() {
    const { state, dispatch } = useGame();

    const completedCount = (worldId: string) => {
        const world = worlds.find(w => w.id === worldId)!;
        return world.levelIds.filter(id => state.completedLevels.includes(id)).length;
    };

    return (
        <div
            className="flex-1 overflow-y-auto game-scroll"
            style={{ background: 'linear-gradient(160deg, #050810 0%, #0a0d1a 60%, #050810 100%)' }}
        >
            {/* Header */}
            <div className="text-center pt-12 pb-8 px-6 game-fade-in">
                <div className="text-5xl mb-4">🦆</div>
                <h1 className="text-white text-3xl font-bold tracking-tight mb-2">
                    Social Media Academy
                </h1>
                <p className="text-white/40 text-base max-w-md mx-auto">
                    Navigate the real challenges of life online — one level at a time.
                </p>
            </div>

            {/* World grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-12 max-w-4xl mx-auto">
                {worlds.map((world, wi) => {
                    const done = completedCount(world.id);
                    const total = world.levelIds.length;
                    const isComplete = done === total;
                    const progressPct = total > 0 ? (done / total) * 100 : 0;

                    return (
                        <div
                            key={world.id}
                            className="world-card relative rounded-2xl overflow-hidden cursor-pointer group"
                            style={{
                                background: world.gradient,
                                border: `1px solid rgba(255,255,255,0.1)`,
                                animationDelay: `${wi * 60}ms`,
                            }}
                            onClick={() => {
                                // Open first incomplete level, or first level if all done
                                const firstIncomplete = world.levelIds.find(
                                    id => !state.completedLevels.includes(id)
                                ) ?? world.levelIds[0];
                                if (firstIncomplete) dispatch({ type: 'START_LEVEL', levelId: firstIncomplete });
                            }}
                        >
                            {/* Shimmer overlay */}
                            <div className="world-card-shimmer absolute inset-0 pointer-events-none" />

                            {/* Hover glow */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{ background: `radial-gradient(ellipse at 50% 0%, ${world.accent}18 0%, transparent 70%)` }}
                            />

                            <div className="relative p-5">
                                {/* Emoji + complete badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-4xl">{world.emoji}</span>
                                    {isComplete && (
                                        <span
                                            className="text-xs font-bold px-2 py-0.5 rounded-full game-pop-in"
                                            style={{
                                                background: world.accent + '33',
                                                color: world.accent,
                                                border: `1px solid ${world.accent}55`,
                                            }}
                                        >
                                            ✓ DONE
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <h2 className="text-white font-bold text-lg mb-0.5 leading-tight">
                                    {world.name}
                                </h2>
                                <p className="text-white/50 text-sm mb-4">{world.tagline}</p>

                                {/* Level list */}
                                <div className="space-y-1 mb-4">
                                    {world.levelIds.map((lid, li) => {
                                        const level = levelMap[lid];
                                        const done = state.completedLevels.includes(lid);
                                        return (
                                            <div key={lid} className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-all"
                                                    style={{
                                                        background: done ? world.accent : 'rgba(255,255,255,0.12)',
                                                        color: done ? '#000' : 'rgba(255,255,255,0.4)',
                                                        border: done ? 'none' : '1px solid rgba(255,255,255,0.15)',
                                                    }}
                                                >
                                                    {done ? '✓' : li + 1}
                                                </div>
                                                <span
                                                    className="text-xs"
                                                    style={{ color: done ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}
                                                >
                                                    {level?.title ?? `Level ${li + 1}`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress bar */}
                                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${progressPct}%`,
                                            background: world.accent,
                                            boxShadow: progressPct > 0 ? `0 0 8px ${world.accent}88` : undefined,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-white/30 text-xs">{done}/{total} complete</span>
                                    <span
                                        className="text-xs font-medium group-hover:translate-x-0.5 transition-transform inline-block"
                                        style={{ color: world.accent + 'cc' }}
                                    >
                                        {done === 0 ? 'Start →' : done === total ? 'Replay →' : 'Continue →'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
