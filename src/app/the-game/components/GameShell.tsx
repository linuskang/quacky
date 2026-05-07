"use client";

import { useGame } from '../engine/GameContext';
import TopBar from './TopBar';
import SceneView from './SceneView';
import ControlsBar from './ControlsBar';
import LevelMap from './LevelMap';

export default function GameShell() {
    const { state, currentWorld } = useGame();

    const isOnMap = state.screen === 'map';

    // World background gradient — defaults to deep space when on map
    const worldGradient = currentWorld?.gradient
        ?? 'linear-gradient(160deg, #050810 0%, #0a0d1a 60%, #050810 100%)';

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden"
            style={{
                background: worldGradient,
                transition: 'background 0.8s ease',
                fontFamily: 'var(--font-sans)',
            }}
        >
            {isOnMap ? (
                <LevelMap />
            ) : (
                <>
                    {/* Sinerider-style layout: TopBar → Scene → ControlsBar */}
                    <TopBar />

                    {/* Atmospheric particles / glow in background */}
                    {currentWorld && (
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${currentWorld.accent}12 0%, transparent 70%)`,
                            }}
                        />
                    )}

                    <SceneView />
                    <ControlsBar />
                </>
            )}
        </div>
    );
}
