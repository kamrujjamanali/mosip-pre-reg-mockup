import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subscription } from 'rxjs';

export interface TermsModalData {
  // You can pass custom text later if needed
}

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  templateUrl: './terms-modal.html',
  styleUrls: ['./terms-modal.scss'],
})
export class TermsModalComponent implements OnInit, OnDestroy{
  private readonly themeService = inject(ThemeService);
  private readonly dialogRef = inject(MatDialogRef<TermsModalComponent>);
  private readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as any;

  theme: ThemeName = 'default';
  private sub?: Subscription;

  accepted = false;
  expanded = true;

  // Hardcoded content (you can replace text)
  titleTop = 'TERMS AND CONDITIONS';
  panelTitle = 'Terms and Conditions';

  agreementTitle = 'Your Agreement';
  bullets = [
    'Name',
    'Date of birth',
    'Gender',
    'Address',
    'Contact details',
    'Documents',
  ];

  paragraph =
    `I acknowledge that this information will be stored and processed solely for the purpose of facilitating my access to the MOSIP's
sandbox environments. I consent to the collection of this data to facilitate my access to MOSIP sandbox and services running
within the environment.`;

  ngOnInit() {
    this.sub = this.themeService.theme$.subscribe(t => (this.theme = t));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  cancel() {
    this.dialogRef.close({ accepted: false });
  }

  accept() {
    if (!this.accepted) return;
    this.dialogRef.close({ accepted: true });
  }
}