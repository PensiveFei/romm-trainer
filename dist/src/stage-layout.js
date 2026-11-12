// Keep the touch lanes and the visible note path aligned with the stage.
export function stageLayout(width, height, portraitPhone = false) {
  const usable = Math.min(width * (portraitPhone ? 0.94 : 0.78), 1050);
  const hitY = height - 120;
  const spawnY = Math.min(portraitPhone ? 150 : 142, hitY - (portraitPhone ? 100 : 160));
  // A taller phone stage can show more of the upcoming chart at the same setting.
  const travelMs = portraitPhone ? Math.max(2200, Math.min(4000, (hitY - spawnY) * 7)) : 2200;
  return {
    left: (width - usable) / 2,
    laneWidth: usable / 6,
    hitY,
    spawnY,
    clipTop: portraitPhone ? Math.max(72, spawnY) : 72,
    travelMs,
  };
}
