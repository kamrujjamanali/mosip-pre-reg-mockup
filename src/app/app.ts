import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LoginComponent } from "./modules/login/login";
import { NavbarComponent } from './modules/navbar/navbar';
import { Footer } from './modules/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [CommonModule, NavbarComponent, Footer, RouterOutlet],
})
export class App implements OnInit {
  protected readonly title = signal('mosip-pre-reg-mockup');
  theme: any;
  isLoggedIn = false;
  constructor(private themeService: ThemeService) {
    this.theme = this.themeService.theme$.subscribe((t) => (this.theme = t));
  }

  ngOnInit(): void {
    this.themeService.loggedIn$.subscribe((t) => {
      this.isLoggedIn = t;
      console.log('App loggedIn:', this.isLoggedIn);
    });
  }
}
