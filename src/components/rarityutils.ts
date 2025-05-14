// rarityUtils.ts
export interface RarityStyle {
  className: string;
  icon: string; // emoji or icon class
}

export const rarityToStyle = (rarityRaw: string): RarityStyle => {
  const rarity = (rarityRaw || '').replace(/\s+/g, '');

  const mapping: Record<string, RarityStyle> = {
    ConsumerGrade: { className: 'rarity-ConsumerGrade', icon: '⚪' },
    IndustrialGrade: { className: 'rarity-IndustrialGrade', icon: '🔵' },
    MilSpecGrade: { className: 'rarity-MilSpecGrade', icon: '🔷' },
    Restricted: { className: 'rarity-Restricted', icon: '🟣' },
    Classified: { className: 'rarity-Classified', icon: '🟪' },
    Covert: { className: 'rarity-Covert', icon: '🔴' },
    Contraband: { className: 'rarity-Contraband', icon: '🟠' },

    BaseGrade: { className: 'rarity-BaseGrade', icon: '⚪' },
    HighGrade: { className: 'rarity-HighGrade', icon: '🔵' },
    Remarkable: { className: 'rarity-Remarkable', icon: '🟣' },
    Exotic: { className: 'rarity-Exotic', icon: '🟪' },
    Extraordinary: { className: 'rarity-Extraordinary', icon: '🔴' },

    Distinguished: { className: 'rarity-Distinguished', icon: '🔷' },
    Superior: { className: 'rarity-Superior', icon: '🟣' },
    MasterAgent: { className: 'rarity-MasterAgent', icon: '🔴' },
  };

  return mapping[rarity] ?? { className: 'rarity-BaseGrade', icon: '❔' };
};
