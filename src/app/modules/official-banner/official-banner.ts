import { Component, inject } from '@angular/core';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-official-banner',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './official-banner.html',
  styleUrl: './official-banner.scss',
})
export class OfficialBanner {
  private readonly themeService = inject(ThemeService);

  theme: ThemeName = 'default';
  themes = this.themeService.themes;
  private sub?: Subscription;

  /* === ST. VINCENT CONTENT === */
  crestUrl = 'assets/gosvg-logo.png';

  leftTitle = 'Government of Saint Vincent and the Grenadines';
  leftSub = 'Office of the Prime Minister';

  rightTitle = 'National Identification System';
  rightSub = 'Civil Registry & Identity Authority';

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe((t) => (this.theme = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  changeTheme(t: ThemeName) {
    this.themeService.setTheme(t);
  }
}
