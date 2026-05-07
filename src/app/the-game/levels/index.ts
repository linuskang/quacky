import { privacyLevels } from './privacy';
import { misinformationLevels } from './misinformation';
import { phishingLevels } from './phishing';
import { cyberbullyingLevels } from './cyberbullying';
import { footprintLevels } from './footprint';
import { algorithmLevels } from './algorithm';
import type { Level } from './types';

export * from './types';
export * from './worlds';

export const allLevels: Level[] = [
    ...privacyLevels,
    ...misinformationLevels,
    ...phishingLevels,
    ...cyberbullyingLevels,
    ...footprintLevels,
    ...algorithmLevels,
];

export const levelMap: Record<string, Level> = Object.fromEntries(
    allLevels.map(l => [l.id, l])
);
