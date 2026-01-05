// src/app/select-language-dialog/select-language-dialog.component.ts
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { ThemeName, ThemeService } from '../../core/services/theme.service';

type Lang = { code: string; label: string; mandatory?: boolean };

@Component({
  selector: 'app-select-language-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './select-languae-modal.html',
  styleUrls: ['./select-languae-modal.scss'],
})
export class SelectLanguaeModal implements OnInit, OnDestroy {
  theme: ThemeName = 'default';
  private sub?: Subscription;

  // Hardcoded language list (matches screenshot style)
  languages: Lang[] = [
    { code: 'eng', label: 'English', mandatory: true },
    { code: 'ara', label: 'العربية' },
    { code: 'fra', label: 'français' },
    { code: 'hin', label: 'हिंदी' },
    { code: 'tam', label: 'தமிழ்' },
    { code: 'kan', label: 'ಕನ್ನಡ' },
  ];

  // Rules (hardcoded)
  minSelect = 1;
  maxSelect = 2;

  selectedCodes = new Set<string>();
  error = '';

  constructor(
    private dialogRef: MatDialogRef<SelectLanguaeModal>,
    private themeService: ThemeService,
    @Inject(MAT_DIALOG_DATA) public data: { selected?: string[] }
  ) {}

  ngOnInit() {
    this.sub = this.themeService.theme$.subscribe(t => (this.theme = t));

    // initial selection: English always selected
    this.selectedCodes.add('eng');

    // optional initial values by label
    if (this.data?.selected?.length) {
      this.data.selected.forEach(lbl => {
        const lang = this.languages.find(l => l.label === lbl);
        if (lang) this.selectedCodes.add(lang.code);
      });
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  isChecked(code: string) {
    return this.selectedCodes.has(code);
  }

  toggle(lang: Lang, checked: boolean) {
    this.error = '';

    // English mandatory
    if (lang.mandatory) {
      this.selectedCodes.add(lang.code);
      return;
    }

    if (checked) {
      if (this.selectedCodes.size >= this.maxSelect) {
        this.error = `You can select maximum ${this.maxSelect} languages.`;
        return;
      }
      this.selectedCodes.add(lang.code);
    } else {
      this.selectedCodes.delete(lang.code);
    }
  }

  cancel() {
    this.dialogRef.close({ submitted: false });
  }

  submit() {
    this.error = '';

    if (this.selectedCodes.size < this.minSelect) {
      this.error = `Please select at least ${this.minSelect} language.`;
      return;
    }

    // always ensure English
    this.selectedCodes.add('eng');

    const selected = this.languages
      .filter(l => this.selectedCodes.has(l.code))
      .map(l => l.label);

    this.dialogRef.close({ submitted: true, selected });
  }

  isDisabled(lang: Lang): boolean {
    if (lang.mandatory) return true;
    // disable unchecked boxes when max reached
    return !this.selectedCodes.has(lang.code) && this.selectedCodes.size >= this.maxSelect;
  }
}
