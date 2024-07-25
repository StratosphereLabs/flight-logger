export const getAltitudeColor = (value: number): string => {
  const green = { r: 0, g: 255, b: 0 };
  const blue = { r: 0, g: 0, b: 255 };
  const r = Math.round(green.r + value * (blue.r - green.r));
  const g = Math.round(green.g + value * (blue.g - green.g));
  const b = Math.round(green.b + value * (blue.b - green.b));
  return `rgb(${r}, ${g}, ${b})`;
};
