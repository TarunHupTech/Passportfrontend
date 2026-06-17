// Client-side mirror of the server valuation engine (server/utils/valuation.js).
// Lets the add/edit form show a live estimate before saving.

const rate = (map, key) => Number(map?.[key]) || 0;
const round = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function valueItem(form, settings) {
  if (!settings) return null;
  const netWeight = Number(form.netWeight) || 0;
  const stoneWeight = Number(form.stoneWeight) || 0;
  const makingCharges = Number(form.makingCharges) || 0;

  const metalValue = netWeight * rate(settings.goldRates, form.purity);
  const stoneValue = stoneWeight * rate(settings.stoneRates, form.stoneType);
  const estimatedValue = metalValue + stoneValue + makingCharges;
  const resaleValue =
    metalValue * (settings.resaleFactorMetal ?? 0.9) +
    stoneValue * (settings.resaleFactorStone ?? 0.6);

  return {
    metalValue: round(metalValue),
    stoneValue: round(stoneValue),
    makingCharges: round(makingCharges),
    estimatedValue: round(estimatedValue),
    resaleValue: round(resaleValue),
  };
}
