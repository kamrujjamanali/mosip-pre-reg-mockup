// src/app/theme/theme.model.ts
export type ThemeName = 'default' | 'svg_gov' | 'modern';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;

  // CSS variables (kept simple + Material-friendly)
  vars: Record<string, string>;
}
