type ThemeVars = Record<string, string>;

const getValidValueInRange = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function srgbToLin(c: number) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function hexToRgb(hex: string) {
  const m = hex.replace('#', '');
  const i = parseInt(
    m.length === 3
      ? m
          .split('')
          .map((x) => x + x)
          .join('')
      : m,
    16,
  );
  return { r: (i >> 16) & 255, g: (i >> 8) & 255, b: i & 255 };
}
function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLin(r),
    G = srgbToLin(g),
    B = srgbToLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function getContrastRatio(fgHex: string, bgHex: string) {
  const luminanceOne = relativeLuminance(fgHex);
  const luminanceTwo = relativeLuminance(bgHex);
  const lighter = Math.max(luminanceOne, luminanceTwo);
  const darker = Math.min(luminanceOne, luminanceTwo);
  return (lighter + 0.05) / (darker + 0.05);
}

function hslToHex(h: number, s: number, l: number) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c);
  };
  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

const fontByGenre: Record<number, { heading: string; body: string }> = {
  28: { heading: "'Bebas Neue', sans-serif", body: "'Inter', system-ui, sans-serif" },
  878: { heading: "'Orbitron', sans-serif", body: "'IBM Plex Sans', sans-serif" },
  12: { heading: "'Cinzel', serif", body: "'Merriweather Sans', sans-serif" },
  16: { heading: "'Baloo 2', sans-serif", body: "'Nunito', sans-serif" },
  10751: { heading: "'Fredoka', sans-serif", body: "'Rubik', sans-serif" },
  53: { heading: "'Oswald', sans-serif", body: "'Source Sans 3', sans-serif" },
};

export function themeFromGenreId(genreId?: number): ThemeVars {
  const TEXT_COLOR = '#f2f3f5';
  const MUTED_COLOR = '#b9bcc6';
  const CHIP_BG_COLOR = '#1d1f25';
  const BORDER_RADIUS = '14px';
  const GAP = '24px';

  const h = Number.isFinite(genreId) ? (Number(genreId) * 47) % 360 : 350;

  let bgL = 10; // 10% very dark
  let panelL = 14; // a bit lighter for panels

  const sBg = 22; // small saturation for bg and panels
  let bgHex = hslToHex(h, sBg, bgL);

  while (getContrastRatio(TEXT_COLOR, bgHex) < 4.5 && bgL > 4) {
    bgL -= 1; // reduce lightness until contrast is ok
    bgHex = hslToHex(h, sBg, bgL);
  }

  let panelHex = hslToHex(h, sBg, panelL);
  if (getContrastRatio(panelHex, bgHex) < 1.2) {
    panelL = getValidValueInRange(panelL + 2, 8, 18);
    panelHex = hslToHex(h, sBg, panelL);
  }

  const sPrim = 70;
  let primL = 40;
  let primaryHex = hslToHex(h, sPrim, primL);
  while (getContrastRatio('#ffffff', primaryHex) < 4.5 && primL > 25) {
    primL -= 1;
    primaryHex = hslToHex(h, sPrim, primL);
  }
  const primary600Hex = hslToHex(h, sPrim, getValidValueInRange(primL - 6, 15, 60));

  const fonts = fontByGenre[genreId ?? 0] || {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  };

  return {
    '--bg': bgHex,
    '--panel': panelHex,
    '--text': TEXT_COLOR,
    '--muted': MUTED_COLOR,
    '--chip': CHIP_BG_COLOR,
    '--primary': primaryHex,
    '--primary-600': primary600Hex,
    '--radius': BORDER_RADIUS,
    '--gap': GAP,
    '--font-heading': fonts.heading,
    '--font-body': fonts.body,
  };
}
