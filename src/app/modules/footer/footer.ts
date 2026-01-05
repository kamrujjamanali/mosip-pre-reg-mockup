import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly themeService = inject(ThemeService);

  theme: ThemeName = 'default';
  private sub?: Subscription;

  year = new Date().getFullYear();

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe((t) => (this.theme = t));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
