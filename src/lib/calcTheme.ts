import { Theme, Color, BackgroundColor } from "@adobe/leonardo-contrast-colors";
import { RGB } from "./KMeans";
import chroma from "chroma-js";

const calcTheme = (rgbList: RGB[]) => {
  const bg = new BackgroundColor({
    name: "bg",
    colorKeys: [getHex(rgbList[0])],
    ratios: [1, 1.2, 1.4],
  });

  const ui = new Color({
    name: "ui",
    colorKeys: [getHex(rgbList[1])],
    colorspace: "OKLAB",
    ratios: [10, 8, 7],
  });

  const accent_primary = new Color({
    name: "accent_primary",
    colorKeys: [getHex(rgbList[2])],
    colorspace: "OKLAB",
    ratios: [10, 2],
  });

  const chromaBG = chroma([rgbList[0].red, rgbList[0].green, rgbList[0].blue]);

  const lightness =
    chromaBG.get("lab.l") > 50
      ? Math.max(chromaBG.get("lab.l"), 95)
      : Math.min(chromaBG.get("lab.l"), 5);

  const theme = new Theme({
    colors: [bg, ui, accent_primary],
    backgroundColor: bg,
    lightness: Math.floor(lightness),
  });

  console.log(theme);

  const contrast = theme.contrastColorPairs;

  return {
    version: 2,
    basic: {
      accent: {
        primary: contrast["accent_primary100"],
        notification: getHex(rgbList[3]),
        online: getHex(rgbList[4]),
        error: getHex(rgbList[5]),
        focus: getHex(rgbList[2]) + "c0",
      },
      background: {
        primary: contrast["bg100"],
        secondary: contrast["bg200"],
        tertiary: contrast["bg300"],
      },
      ui: {
        primary: contrast["ui100"],
        secondary: contrast["ui200"],
        tertiary: contrast["ui300"],
      },
      text: {
        primary: contrast["accent_primary200"],
        secondary: contrast["accent_primary100"],
      },
    },
  };
};

const getHex = (rgb: RGB): `#${string}` => {
  const toHexValue = (a: number) => ("0" + a.toString(16)).slice(-2);
  return `#${toHexValue(rgb.red)}${toHexValue(rgb.green)}${toHexValue(
    rgb.blue
  )}`;
};

const toRgb = (hex: string): RGB => {
  return {
    red: parseInt(hex.substring(1, 3), 16),
    green: parseInt(hex.substring(3, 5), 16),
    blue: parseInt(hex.substring(5, 7), 16),
  };
};

export { calcTheme, getHex, toRgb };
