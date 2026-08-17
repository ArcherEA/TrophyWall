import { describe, it, expect } from 'vitest';
import {
  agentRarity,
  discRarity,
  statLabel,
  computeMainStat,
  computeSubStat,
  stripTooltipTags,
} from './zzz-transform.js';
import type { PropertyEntry } from './zzz.store.js';

// minimal property map mirroring the real store (Format's '%' marks a percentage stat)
const property: Record<string, PropertyEntry> = {
  '11103': { Name: 'HpMax', Format: '{0:0}' },
  '12103': { Name: 'Atk', Format: '{0:0.#}' },
  '21103': { Name: 'CritDmg', Format: '{0:0.#%}' },
  '23103': { Name: 'PenRatio', Format: '{0:0.#%}' },
  '30903': { Name: 'HpMax_Ratio', Format: '{0:0.#%}' },
  '13203': { Name: 'Atk_Ratio', Format: '{0:0.#%}' },
};

describe('zzz rarity maps', () => {
  it('maps agent rarity 4→S, 3→A', () => {
    expect(agentRarity(4)).toBe('S');
    expect(agentRarity(3)).toBe('A');
  });
  it('maps disc rarity 4→S, 3→A, 2→B', () => {
    expect(discRarity(4)).toBe('S');
    expect(discRarity(3)).toBe('A');
    expect(discRarity(2)).toBe('B');
  });
});

describe('zzz statLabel', () => {
  it('resolves friendly labels and strips _Ratio', () => {
    expect(statLabel('CritDmg')).toBe('CRIT DMG');
    expect(statLabel('HpMax_Ratio')).toBe('HP');
    expect(statLabel('PenRatio')).toBe('PEN Ratio');
    expect(statLabel('Unknown')).toBe('Unknown');
  });
});

describe('zzz stripTooltipTags', () => {
  it('strips <color> markup to plain text', () => {
    expect(
      stripTooltipTags('Increases <color=#98EFF0>Ice DMG</color> by <color=#2BAD00>25%</color>.'),
    ).toBe('Increases Ice DMG by 25%.');
  });
  it('returns null for empty/undefined', () => {
    expect(stripTooltipTags(undefined)).toBeNull();
    expect(stripTooltipTags('')).toBeNull();
  });
});

describe('zzz substat scaling (total = value × rolls)', () => {
  it('percent substat: 480×1 → 4.8%', () => {
    const s = computeSubStat({ PropertyId: 21103, PropertyLevel: 1, PropertyValue: 480 }, property);
    expect(s).toMatchObject({ label: 'CRIT DMG', value: 4.8, isPercent: true, rolls: 1 });
  });
  it('percent substat accumulates: 480×3 → 14.4%', () => {
    const s = computeSubStat({ PropertyId: 21103, PropertyLevel: 3, PropertyValue: 480 }, property);
    expect(s.value).toBeCloseTo(14.4, 5);
  });
  it('flat substat: 19×3 → 57 ATK', () => {
    const s = computeSubStat({ PropertyId: 12103, PropertyLevel: 3, PropertyValue: 19 }, property);
    expect(s).toMatchObject({ label: 'ATK', value: 57, isPercent: false });
  });
});

describe('zzz main-stat scaling (final = base × (1 + 3·L/maxLevel))', () => {
  it('S-rank CRIT DMG main 1200 @ +15 → 48.0%', () => {
    const s = computeMainStat(
      { PropertyId: 21103, PropertyLevel: 1, PropertyValue: 1200 },
      15,
      4,
      property,
    );
    expect(s).toMatchObject({ label: 'CRIT DMG', value: 48, isPercent: true });
  });
  it('S-rank flat HP main 550 @ +15 → 2200', () => {
    const s = computeMainStat(
      { PropertyId: 11103, PropertyLevel: 1, PropertyValue: 550 },
      15,
      4,
      property,
    );
    expect(s).toMatchObject({ label: 'HP', value: 2200, isPercent: false });
  });
  it('S-rank ATK% main 750 @ +15 → 30.0%', () => {
    const s = computeMainStat(
      { PropertyId: 13203, PropertyLevel: 1, PropertyValue: 750 },
      15,
      4,
      property,
    );
    expect(s.value).toBeCloseTo(30, 5);
  });
  it('base value at +0 is unscaled', () => {
    const s = computeMainStat(
      { PropertyId: 11103, PropertyLevel: 1, PropertyValue: 550 },
      0,
      4,
      property,
    );
    expect(s.value).toBe(550);
  });
  it('A-rank (maxLevel 12) reaches 4× at +12', () => {
    const s = computeMainStat(
      { PropertyId: 11103, PropertyLevel: 1, PropertyValue: 500 },
      12,
      3,
      property,
    );
    expect(s.value).toBe(2000);
  });
});
