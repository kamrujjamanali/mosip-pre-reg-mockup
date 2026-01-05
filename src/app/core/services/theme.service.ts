// src/app/theme/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeName = 'default' | 'svg_gov' | 'modern';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  vars: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes: ThemeDefinition[] = [
    {
      name: 'default',
      label: 'Default',
      vars: {
        '--bg': '#ffffff',
        '--text': '#111111',
        '--muted': '#9aa0a6',
        '--accent': '#fe528d',
        '--underline': '#80868b',
        '--underline-focus': '#2f5cff',
        '--btn-disabled-bg': '#e0e0e0',
        '--btn-disabled-text': '#b6b6b6',
        '--btn-enabled-bg': '#fe528d',
        '--btn-enabled-text': '#ffffff',
        '--card-bg': 'transparent',
        '--card-border': 'transparent',
        '--card-shadow': 'none',

        '--modal-accent': '#fe528d',
        '--modal-title': '#fe528d',
        '--modal-border': 'transparent',
        '--modal-bg': '#ffffff',
        '--modal-shadow': '0 16px 50px rgba(0,0,0,0.10)',
        '--modal-btn-outline': '#fe528d',

        '--tnc-accent': '#fe528d',
        '--tnc-bg': '#ffffff',
        '--tnc-border': 'rgba(2,6,23,0.08)',
        '--tnc-shadow': '0 16px 50px rgba(0,0,0,0.10)',
        '--tnc-muted': '#6b7280',
      },
    },
    {
      name: 'svg_gov',
      label: 'Version 1',
      vars: {
        // St. Vincent flag-inspired background feel (blue / yellow / green)
        '--bg': '#f3f7ff',
        '--text': '#0b1220',
        '--muted': '#526174',
        '--accent': '#002674',
    
        '--underline': '#93a4b6',
        '--underline-focus': '#002674',
    
        '--btn-disabled-bg': '#e2e8f0',
        '--btn-disabled-text': '#94a3b8',
        '--btn-enabled-bg': '#002674',
        '--btn-enabled-text': '#ffffff',
    
        '--card-bg': '#ffffff',
        '--card-border': 'rgba(0,0,0,0.06)',
        '--card-shadow': '0 18px 60px rgba(0, 38, 116, 0.18)',
    
        // extra tokens used by CSS
        '--gov-blue': '#002674',
        '--gov-yellow': '#FCD022',
        '--gov-green': '#007C2E',

        '--modal-accent': '#002674',
        '--modal-title': '#002674',
        '--modal-border': 'rgba(0,0,0,0.06)',
        '--modal-bg': '#ffffff',
        '--modal-shadow': '0 18px 60px rgba(0, 38, 116, 0.18)',
        '--modal-btn-outline': '#002674',

        '--tnc-accent': '#002674',
        '--tnc-bg': '#ffffff',
        '--tnc-border': 'rgba(2,6,23,0.08)',
        '--tnc-shadow': '0 18px 60px rgba(0,38,116,0.18)',
        '--tnc-muted': '#526174',
      },
    },
    
    {
      name: 'modern',
      label: 'Version 2',
      vars: {
        '--bg': '#0b1220',
        '--text': '#111827',
        '--muted': '#6b7280',
    
        // screenshot-style RED accent
        '--accent': '#c0392b',
    
        '--btn-disabled-bg': '#e5e7eb',
        '--btn-disabled-text': '#9ca3af',
        '--btn-enabled-bg': '#c0392b',
        '--btn-enabled-text': '#ffffff',
    
        '--card-bg': '#ffffff',
        '--card-border': 'rgba(2, 6, 23, 0.10)',
        '--card-shadow': '0 24px 70px rgba(0,0,0,0.25)',
    
        // put your image in assets and use this path
        '--modern-bg-image': "url('assets/login-back.jpg')",

        '--modal-accent': '#c0392b',          // modern red like your screenshot example
        '--modal-title': '#c0392b',
        '--modal-border': 'rgba(2,6,23,0.10)',
        '--modal-bg': '#ffffff',
        '--modal-shadow': '0 24px 70px rgba(0,0,0,0.22)',
        '--modal-btn-outline': '#c0392b',

        '--tnc-accent': '#c0392b',
        '--tnc-bg': '#ffffff',
        '--tnc-border': 'rgba(2,6,23,0.10)',
        '--tnc-shadow': '0 24px 70px rgba(0,0,0,0.22)',
        '--tnc-muted': '#667085',
      },
    },    
  ];

  private readonly themeSubject = new BehaviorSubject<ThemeName>('default');
  readonly theme$ = this.themeSubject.asObservable();

  private readonly userLoggedIn = new BehaviorSubject<boolean>(false);
  readonly loggedIn$ = this.userLoggedIn.asObservable();

  constructor() {
    this.applyTheme('default');
  }

  setTheme(theme: ThemeName) {
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  getTheme(): ThemeName {
    return this.themeSubject.value;
  }

  loggedIn(isLoggedIn: boolean) {
    this.userLoggedIn.next(isLoggedIn);
  }

  getLoggedIn(): boolean {
    return this.userLoggedIn.value;
  }

  private applyTheme(theme: ThemeName) {
    const def = this.themes.find(t => t.name === theme) ?? this.themes[0];
    const root = document.documentElement;
    Object.entries(def.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.setAttribute('data-theme', def.name);
  }
}
