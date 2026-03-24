export const COLORS = {
  primary: "#F97316",
  primaryDark: "#C65A0A",
  primarySoft: "#FFE7C2",
  primarySurface: "#FFF1DE",

  background: "#F8EFE3",
  backgroundSoft: "#FCF6EE",

  surface: "#FFFDF9",
  surfaceWarm: "#FFF7ED",
  surfaceMuted: "#FFF8F0",

  border: "#E8D4B8",
  borderStrong: "#F1D0A5",

  text: "#17223B",
  textPrimary: "#17223B",
  textSecondary: "#6B7280",
  textMuted: "#7C6A58",

  title: "#1F2937",
  heading: "#17223B",

  accent: "#B45309",
  accentDark: "#9A3412",

  success: "#22C55E",
  successDark: "#15803D",
  successBg: "#ECFDF3",

  warning: "#D97706",
  warningBg: "#FFF7ED",

  danger: "#C2410C",
  dangerDark: "#B42318",
  dangerBg: "#FFF1ED",

  white: "#FFFFFF",
  black: "#000000",

  overlayLight: "rgba(255,255,255,0.72)",
  overlayDark: "rgba(23,34,59,0.12)",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  "2xl": 26,
  full: 999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  "4xl": 30,
  "5xl": 36,
};

export const FONT_WEIGHT = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
  black: "900" as const,
};

export const LINE_HEIGHT = {
  tight: 16,
  body: 20,
  relaxed: 24,
  heading: 30,
  hero: 38,
};

export const SHADOWS = {
  card: {
    shadowColor: COLORS.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  warmCard: {
    shadowColor: COLORS.warning,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  button: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  strongButton: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  hero: {
    fontSize: FONT_SIZE["5xl"],
    fontWeight: FONT_WEIGHT.black,
    lineHeight: LINE_HEIGHT.hero,
    color: COLORS.heading,
  },

  h1: {
    fontSize: FONT_SIZE["4xl"],
    fontWeight: FONT_WEIGHT.black,
    lineHeight: LINE_HEIGHT.heading,
    color: COLORS.heading,
  },

  h2: {
    fontSize: FONT_SIZE["3xl"],
    fontWeight: FONT_WEIGHT.black,
    lineHeight: 30,
    color: COLORS.heading,
  },

  h3: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    lineHeight: 24,
    color: COLORS.title,
  },

  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    lineHeight: 22,
    color: COLORS.title,
    letterSpacing: 0.4,
  },

  body: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.regular,
    lineHeight: LINE_HEIGHT.body,
    color: COLORS.textSecondary,
  },

  bodyStrong: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: LINE_HEIGHT.body,
    color: COLORS.text,
  },

  caption: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    lineHeight: 16,
    color: COLORS.textMuted,
  },

  badge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.black,
    lineHeight: 14,
    color: COLORS.accentDark,
    letterSpacing: 0.6,
  },

  button: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    lineHeight: 22,
    color: COLORS.white,
    letterSpacing: 0.6,
  },
};

export const COMPONENTS = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screenContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS["2xl"],
    borderWidth: 1.2,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },

  warmCard: {
    backgroundColor: COLORS.surfaceWarm,
    borderRadius: RADIUS["2xl"],
    borderWidth: 1.2,
    borderColor: COLORS.borderStrong,
    padding: SPACING.lg,
    ...SHADOWS.warmCard,
  },

  pickerBox: {
    borderWidth: 1.4,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: "hidden" as const,
    backgroundColor: COLORS.surfaceMuted,
    minHeight: 58,
    justifyContent: "center" as const,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    minHeight: 58,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...SHADOWS.button,
  },

  secondaryButton: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.lg,
    minHeight: 52,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },

  badge: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  successBadge: {
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  errorCard: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: "#F5B7B1",
    padding: SPACING.lg,
  },
};

export const THEME = {
  COLORS,
  SPACING,
  RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  SHADOWS,
  TYPOGRAPHY,
  COMPONENTS,
};

export default THEME;