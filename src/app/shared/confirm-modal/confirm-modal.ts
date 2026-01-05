import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';

export type ConfirmType = 'success' | 'warning' | 'info';

export interface ConfirmModalData {
  title?: string;                 // e.g. "CONFIRMATION"
  heading?: string;               // e.g. "Submit application?"
  message?: string;               // main text
  details?: string[];             // bullet lines (optional)
  type?: ConfirmType;             // controls icon + accent
  confirmText?: string;           // default: "Confirm"
  cancelText?: string;            // default: "Cancel"
  showCancel?: boolean;           // default: true
}

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly dialogRef = inject(MatDialogRef<ConfirmModal>);
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as ConfirmModalData;

  theme: ThemeName = 'default';
  private sub?: Subscription;

  // Defaults
  titleTop = this.data?.title ?? 'CONFIRMATION';
  heading = this.data?.heading ?? 'Are you sure?';
  message =
    this.data?.message ??
    'Please confirm to proceed. This action may not be reversible.';

  details = this.data?.details ?? [];
  type: ConfirmType = this.data?.type ?? 'info';

  confirmText = this.data?.confirmText ?? 'Confirm';
  cancelText = this.data?.cancelText ?? 'Cancel';
  showCancel = this.data?.showCancel ?? true;

  ngOnInit() {
    this.sub = this.themeService.theme$.subscribe(t => (this.theme = t));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  cancel() {
    this.dialogRef.close({ confirmed: false });
  }

  confirm() {
    this.dialogRef.close({ confirmed: true });
  }

  // icon by type
  get icon(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      default:        return 'info';
    }
  }

  // class hook
  get typeClass(): string {
    return `confirm-${this.type}`;
  }
}
