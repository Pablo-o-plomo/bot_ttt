export function analyzeTrade(pnl: number, priceBelowEma: boolean, volumeWeak: boolean): { lesson: string; tags: string[]; summary: string } {
  if (pnl >= 0) return { summary: 'Сделка закрыта в прибыль по правилам стратегии.', tags: ['discipline'], lesson: 'Сохранять системность и риск 1%.' };
  const tags = ['loss'];
  if (priceBelowEma) tags.push('ema-breakdown');
  if (volumeWeak) tags.push('weak-momentum');
  return {
    summary: 'Сделка закрыта в убыток. Причина: цена пробила EMA50 вниз и импульс ослаб.',
    tags,
    lesson: 'Не входить без подтверждения объема минимум на 20% выше среднего.'
  };
}
