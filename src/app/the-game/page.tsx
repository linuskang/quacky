// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

import './game.css';
import { GameProvider } from './engine/GameContext';
import GameShell from './components/GameShell';

export default function TheGamePage() {
    return (
        <GameProvider>
            <GameShell />
        </GameProvider>
    );
}
