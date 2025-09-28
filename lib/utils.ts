import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  getContrast,
  readableColor,
  darken,
  lighten,
  parseToRgb,
  rgba,
  mix,
  complement,
  saturate,
  desaturate,
} from "polished";
import {
  ContrastValidationResult,
  ThemeValidationResult,
  ColorSuggestion,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates contrast ratio between two colors using polished
 */
export function validateContrast(
  color1: string,
  color2: string,
  largeText: boolean = false
): ContrastValidationResult {
  try {
    const ratio = getContrast(color1, color2);

    // WCAG standards
    const aaThreshold = largeText ? 3.0 : 4.5;
    const aaaThreshold = largeText ? 4.5 : 7.0;

    let level: "AAA" | "AA" | "Fail";
    let message: string;

    if (ratio >= aaaThreshold) {
      level = "AAA";
      message = `Excellent contrast ratio: ${ratio.toFixed(2)}:1`;
    } else if (ratio >= aaThreshold) {
      level = "AA";
      message = `Good contrast ratio: ${ratio.toFixed(2)}:1`;
    } else {
      level = "Fail";
      message = `Poor contrast ratio: ${ratio.toFixed(
        2
      )}:1. Minimum required: ${aaThreshold}:1`;
    }

    return {
      isValid: ratio >= aaThreshold,
      ratio: Math.round(ratio * 100) / 100,
      level,
      message,
    };
  } catch (error) {
    return {
      isValid: false,
      ratio: 0,
      level: "Fail",
      message: "Invalid color format",
    };
  }
}

/**
 * Validates all theme colors for accessibility
 */
export function validateThemeColors(
  backgroundColor: string,
  textColor: string,
  titleColor: string
): ThemeValidationResult {
  const backgroundText = validateContrast(backgroundColor, textColor);
  const backgroundTitle = validateContrast(backgroundColor, titleColor, true);

  const errors: string[] = [];

  if (!backgroundText.isValid) {
    errors.push(
      `Text color has insufficient contrast with background. ${backgroundText.message}`
    );
  }

  if (!backgroundTitle.isValid) {
    errors.push(
      `Title color has insufficient contrast with background. ${backgroundTitle.message}`
    );
  }

  return {
    backgroundText,
    backgroundTitle,
    isValidTheme: backgroundText.isValid && backgroundTitle.isValid,
    errors,
  };
}

/**
 * Generate comprehensive color suggestions using polished
 */
export function generateColorSuggestions(
  backgroundColor: string,
  preferredColor: string,
  count: number = 5
): ColorSuggestion[] {
  const suggestions: ColorSuggestion[] = [];
  const targetRatio = 4.5; // AA standard

  try {
    // 1. Auto-readable color
    const auto = readableColor(backgroundColor);
    if (getContrast(backgroundColor, auto) >= targetRatio) {
      suggestions.push({
        color: auto,
        label: "Auto",
        ratio: getContrast(backgroundColor, auto).toFixed(1),
        method: "readable",
      });
    }

    // 2. Darken variations
    for (
      let amount = 0.1;
      amount <= 0.9 && suggestions.length < count;
      amount += 0.1
    ) {
      try {
        const darkened = darken(amount, preferredColor);
        const contrast = getContrast(backgroundColor, darkened);
        if (contrast >= targetRatio) {
          suggestions.push({
            color: darkened,
            label: `${Math.round(amount * 100)}% Darker`,
            ratio: contrast.toFixed(1),
            method: "darken",
          });
        }
      } catch (e) {
        continue;
      }
    }

    // 3. Lighten variations
    for (
      let amount = 0.1;
      amount <= 0.9 && suggestions.length < count;
      amount += 0.1
    ) {
      try {
        const lightened = lighten(amount, preferredColor);
        const contrast = getContrast(backgroundColor, lightened);
        if (contrast >= targetRatio) {
          suggestions.push({
            color: lightened,
            label: `${Math.round(amount * 100)}% Lighter`,
            ratio: contrast.toFixed(1),
            method: "lighten",
          });
        }
      } catch (e) {
        continue;
      }
    }

    // 4. Saturation adjustments
    for (
      let amount = 0.2;
      amount <= 0.8 && suggestions.length < count;
      amount += 0.2
    ) {
      try {
        const desaturated = desaturate(amount, preferredColor);
        const contrast = getContrast(backgroundColor, desaturated);
        if (contrast >= targetRatio) {
          suggestions.push({
            color: desaturated,
            label: `Less Saturated`,
            ratio: contrast.toFixed(1),
            method: "desaturate",
          });
        }
      } catch (e) {
        continue;
      }
    }

    // 5. Complement color
    try {
      const complementColor = complement(preferredColor);
      const contrast = getContrast(backgroundColor, complementColor);
      if (contrast >= targetRatio && suggestions.length < count) {
        suggestions.push({
          color: complementColor,
          label: "Complement",
          ratio: contrast.toFixed(1),
          method: "complement",
        });
      }
    } catch (e) {
      // Continue if complement fails
    }

    // 6. Mixed colors with background
    for (
      let amount = 0.1;
      amount <= 0.3 && suggestions.length < count;
      amount += 0.1
    ) {
      try {
        const mixed = mix(amount, backgroundColor, preferredColor);
        const contrast = getContrast(backgroundColor, mixed);
        if (contrast >= targetRatio) {
          suggestions.push({
            color: mixed,
            label: `Mixed ${Math.round((1 - amount) * 100)}%`,
            ratio: contrast.toFixed(1),
            method: "mix",
          });
        }
      } catch (e) {
        continue;
      }
    }

    // 7. High contrast fallbacks
    const fallbacks = [
      { color: "#000000", label: "Black" },
      { color: "#ffffff", label: "White" },
      { color: "#1a1a1a", label: "Near Black" },
      { color: "#f5f5f5", label: "Near White" },
      { color: "#333333", label: "Dark Gray" },
      { color: "#e0e0e0", label: "Light Gray" },
    ];

    for (const fallback of fallbacks) {
      if (suggestions.length >= count) break;
      try {
        const contrast = getContrast(backgroundColor, fallback.color);
        if (
          contrast >= targetRatio &&
          !suggestions.some((s) => s.color === fallback.color)
        ) {
          suggestions.push({
            color: fallback.color,
            label: fallback.label,
            ratio: contrast.toFixed(1),
            method: "fallback",
          });
        }
      } catch (e) {
        continue;
      }
    }
  } catch (error) {
    // Emergency fallback
    suggestions.push(
      {
        color: "#000000",
        label: "Black",
        ratio: "21.0",
        method: "emergency",
      },
      {
        color: "#ffffff",
        label: "White",
        ratio: "21.0",
        method: "emergency",
      }
    );
  }

  // Remove duplicates and sort by contrast ratio (highest first)
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) =>
      index === self.findIndex((s) => s.color === suggestion.color)
  );

  return uniqueSuggestions
    .sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio))
    .slice(0, count);
}

/**
 * Get the best accessible color automatically
 */
export function getBestAccessibleColor(
  backgroundColor: string,
  preferredColor: string,
  isTitle: boolean = false
): string {
  const targetRatio = isTitle ? 4.5 : 4.5; // AA standard

  try {
    // First try the preferred color
    if (getContrast(backgroundColor, preferredColor) >= targetRatio) {
      return preferredColor;
    }

    // Generate suggestions and pick the best one that's closest to preferred
    const suggestions = generateColorSuggestions(
      backgroundColor,
      preferredColor,
      10
    );

    if (suggestions.length > 0) {
      return suggestions[0].color;
    }

    // Fallback to readableColor
    return readableColor(backgroundColor);
  } catch (error) {
    // Emergency fallback
    return readableColor(backgroundColor, "#000000", "#ffffff");
  }
}

/**
 * Check if a color is valid
 */
export function isValidColor(color: string): boolean {
  try {
    parseToRgb(color);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get color information and analysis
 */
export function getColorInfo(color: string) {
  try {
    const rgb = parseToRgb(color);
    const contrastWithWhite = getContrast("#ffffff", color);
    const contrastWithBlack = getContrast("#000000", color);

    return {
      rgb,
      hex: color,
      contrastWithWhite: contrastWithWhite.toFixed(2),
      contrastWithBlack: contrastWithBlack.toFixed(2),
      isLight: contrastWithWhite < 3, // Light colors have low contrast with white
      luminance: (rgb.red * 0.299 + rgb.green * 0.587 + rgb.blue * 0.114) / 255,
      readableText: readableColor(color),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Create an accessible color palette based on a primary color
 */
export function createAccessiblePalette(primaryColor: string) {
  try {
    const palette = {
      primary: primaryColor,
      primaryReadable: readableColor(primaryColor),
      light: lighten(0.2, primaryColor),
      dark: darken(0.2, primaryColor),
      complement: complement(primaryColor),
      muted: desaturate(0.3, primaryColor),
      // Accessible variants
      accessible: {
        onWhite: getBestAccessibleColor("#ffffff", primaryColor),
        onBlack: getBestAccessibleColor("#000000", primaryColor),
        onLight: getBestAccessibleColor("#f5f5f5", primaryColor),
        onDark: getBestAccessibleColor("#1a1a1a", primaryColor),
      },
    };

    return palette;
  } catch (error) {
    return null;
  }
}

/**
 * Adjust color until it meets accessibility requirements
 */
export function makeAccessible(
  backgroundColor: string,
  textColor: string,
  targetRatio: number = 4.5
): string {
  try {
    const adjustedColor = textColor;
    const currentRatio = getContrast(backgroundColor, adjustedColor);

    if (currentRatio >= targetRatio) {
      return adjustedColor;
    }

    // Try darkening first
    for (let amount = 0.1; amount <= 1; amount += 0.05) {
      const darkened = darken(amount, textColor);
      if (getContrast(backgroundColor, darkened) >= targetRatio) {
        return darkened;
      }
    }

    // Try lightening
    for (let amount = 0.1; amount <= 1; amount += 0.05) {
      const lightened = lighten(amount, textColor);
      if (getContrast(backgroundColor, lightened) >= targetRatio) {
        return lightened;
      }
    }

    // Fallback to readable color
    return readableColor(backgroundColor);
  } catch (error) {
    return readableColor(backgroundColor, "#000000", "#ffffff");
  }
}
