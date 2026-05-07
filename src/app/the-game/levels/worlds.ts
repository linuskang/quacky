import type { World } from './types';

export const worlds: World[] = [
    {
        id: 'privacy',
        name: 'Privacy',
        tagline: 'What you share matters.',
        emoji: '🔒',
        gradient: 'linear-gradient(135deg, #0a0f1e 0%, #0d2247 50%, #0a1628 100%)',
        accent: '#60a5fa',
        levelIds: ['privacy-1', 'privacy-2', 'privacy-3'],
    },
    {
        id: 'misinformation',
        name: 'Misinformation',
        tagline: 'Real or fake? You decide.',
        emoji: '📰',
        gradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1800 50%, #1a0c00 100%)',
        accent: '#fb923c',
        levelIds: ['misinfo-1', 'misinfo-2', 'misinfo-3'],
    },
    {
        id: 'phishing',
        name: 'Phishing',
        tagline: 'Not all messages are safe.',
        emoji: '🎣',
        gradient: 'linear-gradient(135deg, #001510 0%, #003322 50%, #001a12 100%)',
        accent: '#4ade80',
        levelIds: ['phishing-1', 'phishing-2', 'phishing-3'],
    },
    {
        id: 'cyberbullying',
        name: 'Cyberbullying',
        tagline: 'Words online are real too.',
        emoji: '💬',
        gradient: 'linear-gradient(135deg, #0e0018 0%, #240040 50%, #120022 100%)',
        accent: '#c084fc',
        levelIds: ['cyber-1', 'cyber-2', 'cyber-3'],
    },
    {
        id: 'footprint',
        name: 'Digital Footprint',
        tagline: 'Your past follows you.',
        emoji: '👣',
        gradient: 'linear-gradient(135deg, #130800 0%, #2d1400 50%, #150900 100%)',
        accent: '#f97316',
        levelIds: ['footprint-1', 'footprint-2'],
    },
    {
        id: 'algorithm',
        name: 'The Algorithm',
        tagline: 'It knows you better than you think.',
        emoji: '🤖',
        gradient: 'linear-gradient(135deg, #001414 0%, #002828 50%, #001818 100%)',
        accent: '#2dd4bf',
        levelIds: ['algorithm-1', 'algorithm-2'],
    },
];

export const worldMap: Record<string, World> = Object.fromEntries(
    worlds.map(w => [w.id, w])
);
