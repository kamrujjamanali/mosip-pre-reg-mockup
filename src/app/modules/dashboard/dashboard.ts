import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HomeBanner } from '../home-banner/home-banner';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { MatDialog } from '@angular/material/dialog';

type AppItem = {
  id: string;
  name: string;
  appointmentDate: string; // "--" style
  status: 'Application Incomplete' | 'Completed' | 'Draft';
  languages: string;
  selected: boolean;
};

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatCheckboxModule,
    HomeBanner
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  theme: ThemeName = 'default';
  private sub?: Subscription;

  themes = this.themeService.themes;

  apps: AppItem[] = [
    {
      id: '61390154910692',
      name: 'Gyuguu',
      appointmentDate: '2026-01-10',
      status: 'Application Incomplete',
      languages: 'English',
      selected: true,
    },
    {
      id: '61390154910688',
      name: 'Ravi S.',
      appointmentDate: '2026-01-06',
      status: 'Application Incomplete',
      languages: 'English, Français',
      selected: false,
    },
    {
      id: '61390154910689',
      name: 'Aisha K.',
      appointmentDate: '2026-01-09',
      status: 'Completed',
      languages: 'English, العربية',
      selected: false,
    },
    {
      id: '61390154910690',
      name: 'Jean P.',
      appointmentDate: '--',
      status: 'Draft',
      languages: 'English',
      selected: false,
    },
    {
      id: '61390154910691',
      name: 'Kumar T.',
      appointmentDate: '2026-01-12',
      status: 'Application Incomplete',
      languages: 'English, हिंदी',
      selected: false,
    },
    {
      id: '61390154910687',
      name: 'Sara M.',
      appointmentDate: '--',
      status: 'Draft',
      languages: 'English, தமிழ்',
      selected: false,
    },
  ];
  
  govSearch = '';
  govStatusFilter: 'ALL' | AppItem['status'] = 'ALL';
  govSort: 'NEWEST' | 'OLDEST' | 'NAME_ASC' | 'NAME_DESC' = 'NEWEST';

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe((t) => (this.theme = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // selection
  toggleSelect(app: AppItem, checked: boolean) {
    this.apps.forEach((a) => (a.selected = false));
    app.selected = checked;
  }

  // top actions (demo hooks)
  bookOrModifyAppointment() {
    // alert('Book/Modify Appointment (demo hook)');
    // this.router.navigate(['/appointment']);
  }

  preRegistration() {
    this.router.navigate(['/demographic']);
  }

  // card actions (demo hooks)
  modifyInformation(app: AppItem) {
    this.router.navigate(['/demographic']);
  }

  viewAcknowledgement(app: AppItem) {
  }

  deleteApplication(app: AppItem) {
    this.dialog.open(ConfirmModal, {
      width: '480px',
      data: {
        title: 'CONFIRMATION',
        heading: 'Are you sure you want to delete?',
        message: 'This action will permanently delete the selected application.',
        type: 'warning',
        confirmText: 'Yes',
        cancelText: 'No',
        showCancel: true
      }
    }).afterClosed().subscribe(res => {
      if (res?.confirmed) {
        const wasSelected = app.selected; // ✅ NEW: remember selection
        const prevIndex = this.apps.findIndex(a => a.id === app.id); // ✅ NEW
        this.apps = this.apps.filter((a) => a !== app);

        // ✅ NEW: keep UI consistent after delete (select next/prev)
        if (wasSelected && this.apps.length > 0) {
          const next = this.apps[Math.min(prevIndex, this.apps.length - 1)];
          this.toggleSelect(next, true);
        }
      }
    });
  }

  changeTheme(t: ThemeName) {
    this.themeService.setTheme(t);
  }

  get filteredGovApps(): AppItem[] {
    const q = (this.govSearch || '').trim().toLowerCase();

    let list = this.apps.slice();

    if (this.govStatusFilter !== 'ALL') {
      list = list.filter(a => a.status === this.govStatusFilter);
    }

    if (q) {
      list = list.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.languages.toLowerCase().includes(q)
      );
    }

    // sort
    list.sort((a, b) => {
      if (this.govSort === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (this.govSort === 'NAME_DESC') return b.name.localeCompare(a.name);
      if (this.govSort === 'OLDEST') return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id); // NEWEST
    });

    return list;
  }

  // ✅ NEW: helpers
  clearGovSearch() {
    this.govSearch = '';
  }

  trackByAppId(_: number, app: AppItem) {
    return app.id;
  }

  get hasSelectedApp(): boolean {
    return this.apps?.some(a => a.selected) ?? false;
  }  
}
