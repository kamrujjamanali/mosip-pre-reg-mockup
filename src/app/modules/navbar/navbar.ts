import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { OfficialBanner } from '../official-banner/official-banner';

type NavItem = { label: string; path?: string };
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    OfficialBanner
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  @Input() isLoggedIn = false;

  theme: ThemeName = 'default';
  themes = this.themeService.themes;
  private sub?: Subscription;

  // hardcoded menu
  menu: NavItem[] = [
    { label: 'GETTING STARTED', path: '/getting-started' },
    { label: 'FAQ', path: '/faq' },
    { label: 'CONTACT', path: '/contact' },
  ];

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe((t) => (this.theme = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  go(path?: string) {
    if (!path) return;
    this.router.navigate([path]);
  }

  goApplications() {
    this.router.navigate(['/dashboard']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    // demo hook - replace with AuthService
    // alert('Logout (demo hook)');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  changeTheme(t: ThemeName) {
    this.themeService.setTheme(t);
  }
}