"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
} from 'react';
import type { Level, World } from '../levels/types';
import { levelMap, worldMap } from '../levels';

// ─── State ────────────────────────────────────────────────────────────────────

export type Screen = 'map' | 'intro' | 'playing' | 'swipe-feedback' | 'feedback' | 'complete';

export interface GameState {
    screen: Screen;
    currentLevelId: string | null;
    completedLevels: string[];
    introIndex: number;

    // Choice
    chosenOptionId: string | null;

    // Swipe
    swipeIndex: number;
    swipeCorrect: number;
    swipeFeedbackVisible: boolean;
    swipeFeedbackCorrect: boolean;
    swipeFeedbackExplanation: string;

    // Configure
    configValues: Record<string, boolean>;

    // End-of-level feedback
    feedbackSuccess: boolean;
    feedbackMessage: string;
    feedbackExplanation: string;
}

const initial: GameState = {
    screen: 'map',
    currentLevelId: null,
    completedLevels: [],
    introIndex: 0,
    chosenOptionId: null,
    swipeIndex: 0,
    swipeCorrect: 0,
    swipeFeedbackVisible: false,
    swipeFeedbackCorrect: false,
    swipeFeedbackExplanation: '',
    configValues: {},
    feedbackSuccess: false,
    feedbackMessage: '',
    feedbackExplanation: '',
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type GameAction =
    | { type: 'LOAD_PROGRESS'; completedLevels: string[] }
    | { type: 'GO_TO_MAP' }
    | { type: 'START_LEVEL'; levelId: string }
    | { type: 'ADVANCE_INTRO' }
    | { type: 'CHOOSE_OPTION'; optionId: string }
    | { type: 'SWIPE'; direction: 'left' | 'right' }
    | { type: 'SWIPE_NEXT' }
    | { type: 'TOGGLE_CONFIG'; settingId: string }
    | { type: 'SUBMIT_CONFIG' }
    | { type: 'DISMISS_FEEDBACK' }
    | { type: 'NEXT_LEVEL' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function getInitialConfig(level: Level): Record<string, boolean> {
    if (level.challenge.type !== 'configure') return {};
    return Object.fromEntries(level.challenge.settings.map(s => [s.id, s.value]));
}

function reducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {

        case 'LOAD_PROGRESS':
            return { ...state, completedLevels: action.completedLevels };

        case 'GO_TO_MAP':
            return { ...state, screen: 'map', currentLevelId: null };

        case 'START_LEVEL': {
            const level = levelMap[action.levelId];
            if (!level) return state;
            return {
                ...state,
                screen: 'intro',
                currentLevelId: action.levelId,
                introIndex: 0,
                chosenOptionId: null,
                swipeIndex: 0,
                swipeCorrect: 0,
                swipeFeedbackVisible: false,
                swipeFeedbackCorrect: false,
                swipeFeedbackExplanation: '',
                configValues: getInitialConfig(level),
                feedbackSuccess: false,
                feedbackMessage: '',
                feedbackExplanation: '',
            };
        }

        case 'ADVANCE_INTRO': {
            const level = levelMap[state.currentLevelId!];
            if (!level) return state;
            if (state.introIndex < level.intro.length - 1)
                return { ...state, introIndex: state.introIndex + 1 };
            return { ...state, screen: 'playing' };
        }

        case 'CHOOSE_OPTION': {
            const level = levelMap[state.currentLevelId!];
            if (!level || level.challenge.type !== 'choice') return state;
            const opt = level.challenge.options.find(o => o.id === action.optionId);
            if (!opt) return state;
            const newCompleted = opt.correct && !state.completedLevels.includes(level.id)
                ? [...state.completedLevels, level.id]
                : state.completedLevels;
            return {
                ...state,
                chosenOptionId: action.optionId,
                screen: 'feedback',
                completedLevels: opt.correct ? newCompleted : state.completedLevels,
                feedbackSuccess: opt.correct,
                feedbackMessage: opt.outcome,
                feedbackExplanation: opt.correct ? level.lesson : '',
            };
        }

        case 'SWIPE': {
            const level = levelMap[state.currentLevelId!];
            if (!level || level.challenge.type !== 'swipe') return state;
            const items = level.challenge.items;
            const current = items[state.swipeIndex];
            const userSaysRight = action.direction === 'right';
            const correct = userSaysRight === current.isReal;
            const newCorrect = state.swipeCorrect + (correct ? 1 : 0);
            const isLast = state.swipeIndex + 1 >= items.length;

            if (isLast) {
                const success = newCorrect >= Math.ceil(items.length * 0.6);
                const newCompleted = success && !state.completedLevels.includes(level.id)
                    ? [...state.completedLevels, level.id]
                    : state.completedLevels;
                return {
                    ...state,
                    swipeCorrect: newCorrect,
                    swipeFeedbackVisible: true,
                    swipeFeedbackCorrect: correct,
                    swipeFeedbackExplanation: current.explanation,
                    screen: 'swipe-feedback',
                    completedLevels: success ? newCompleted : state.completedLevels,
                    feedbackSuccess: success,
                    feedbackMessage: success
                        ? `Great job! You got ${newCorrect}/${items.length} correct. 🎉`
                        : `You got ${newCorrect}/${items.length}. Give it another shot!`,
                    feedbackExplanation: level.lesson,
                };
            }

            return {
                ...state,
                swipeCorrect: newCorrect,
                swipeIndex: state.swipeIndex, // stays — SWIPE_NEXT advances it
                swipeFeedbackVisible: true,
                swipeFeedbackCorrect: correct,
                swipeFeedbackExplanation: current.explanation,
                screen: 'swipe-feedback',
            };
        }

        case 'SWIPE_NEXT': {
            const level = levelMap[state.currentLevelId!];
            if (!level || level.challenge.type !== 'swipe') return state;
            const isLast = state.swipeIndex + 1 >= level.challenge.items.length;
            if (isLast) {
                return { ...state, screen: 'feedback', swipeFeedbackVisible: false };
            }
            return {
                ...state,
                swipeIndex: state.swipeIndex + 1,
                swipeFeedbackVisible: false,
                screen: 'playing',
            };
        }

        case 'TOGGLE_CONFIG':
            return {
                ...state,
                configValues: {
                    ...state.configValues,
                    [action.settingId]: !state.configValues[action.settingId],
                },
            };

        case 'SUBMIT_CONFIG': {
            const level = levelMap[state.currentLevelId!];
            if (!level || level.challenge.type !== 'configure') return state;
            const allCorrect = level.challenge.settings.every(
                s => state.configValues[s.id] === s.correctValue
            );
            const wrong = level.challenge.settings.filter(
                s => state.configValues[s.id] !== s.correctValue
            );
            const newCompleted = allCorrect && !state.completedLevels.includes(level.id)
                ? [...state.completedLevels, level.id]
                : state.completedLevels;
            return {
                ...state,
                screen: 'feedback',
                completedLevels: allCorrect ? newCompleted : state.completedLevels,
                feedbackSuccess: allCorrect,
                feedbackMessage: allCorrect
                    ? 'Perfect settings! All correct. 🔒'
                    : `${wrong.length} setting${wrong.length > 1 ? 's' : ''} still need${wrong.length === 1 ? 's' : ''} fixing.`,
                feedbackExplanation: allCorrect ? level.lesson : '',
            };
        }

        case 'DISMISS_FEEDBACK': {
            if (state.feedbackSuccess) {
                return { ...state, screen: 'complete' };
            }
            // retry
            const level = levelMap[state.currentLevelId!];
            if (!level) return { ...state, screen: 'map' };
            return {
                ...state,
                screen: 'playing',
                chosenOptionId: null,
                swipeIndex: 0,
                swipeCorrect: 0,
                swipeFeedbackVisible: false,
                configValues: getInitialConfig(level),
                feedbackSuccess: false,
                feedbackMessage: '',
                feedbackExplanation: '',
            };
        }

        case 'NEXT_LEVEL': {
            const level = levelMap[state.currentLevelId!];
            if (!level) return { ...state, screen: 'map' };
            const world = worldMap[level.worldId];
            const idx = world.levelIds.indexOf(level.id);
            const nextId = world.levelIds[idx + 1];
            if (!nextId) return { ...state, screen: 'map' };
            const nextLevel = levelMap[nextId];
            return {
                ...state,
                screen: 'intro',
                currentLevelId: nextId,
                introIndex: 0,
                chosenOptionId: null,
                swipeIndex: 0,
                swipeCorrect: 0,
                swipeFeedbackVisible: false,
                configValues: getInitialConfig(nextLevel),
                feedbackSuccess: false,
                feedbackMessage: '',
                feedbackExplanation: '',
            };
        }

        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface GameContextValue {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    currentLevel: Level | null;
    currentWorld: World | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initial);

    const currentLevel = state.currentLevelId ? (levelMap[state.currentLevelId] ?? null) : null;
    const currentWorld = currentLevel ? (worldMap[currentLevel.worldId] ?? null) : null;

    useEffect(() => {
        try {
            const saved = localStorage.getItem('quacky-game-v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed.completedLevels)) {
                    dispatch({ type: 'LOAD_PROGRESS', completedLevels: parsed.completedLevels });
                }
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('quacky-game-v1', JSON.stringify({
                completedLevels: state.completedLevels,
            }));
        } catch { /* ignore */ }
    }, [state.completedLevels]);

    return (
        <GameContext.Provider value={{ state, dispatch, currentLevel, currentWorld }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within GameProvider');
    return ctx;
}
