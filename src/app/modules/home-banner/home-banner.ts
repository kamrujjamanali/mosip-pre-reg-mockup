import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-home-banner',
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './home-banner.html',
  styleUrl: './home-banner.scss',
})
export class HomeBanner {
  backgroundImage: string = 'assets/user-info-background.jpg';
  lastLogin = new Date();

}
