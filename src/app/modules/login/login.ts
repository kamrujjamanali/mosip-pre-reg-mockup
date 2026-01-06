// src/app/login/login-mock.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';


// Material ONLY used for modern layout (outline fields)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';
import { MatDialog } from '@angular/material/dialog';

type Dir = 'ltr' | 'rtl';

@Component({
  selector: 'app-login-mock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Modern layout uses these:
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  themes = this.themeService.themes;
  theme: ThemeName = this.themeService.getTheme();
  private themeSub?: Subscription;

  // language (hardcoded)
  selectedLanguage = 'eng';
  dir: Dir = 'ltr';
  languageCodeValue = [
    { code: 'eng', value: 'English', dir: 'ltr' as Dir },
    { code: 'ara', value: 'العربية', dir: 'rtl' as Dir },
    { code: 'fra', value: 'français', dir: 'ltr' as Dir },
    { code: 'hin', value: 'हिंदी', dir: 'ltr' as Dir },
    { code: 'tam', value: 'தமிழ்', dir: 'ltr' as Dir },
    { code: 'kan', value: 'ಕನ್ನಡ', dir: 'ltr' as Dir },
  ];

  // flow
  stage: 'contact' | 'otp' = 'contact';

  // shared fields
  contact = '';
  otp = '';
  captchaChecked = false; // default+govt

  // otp timer
  minutes = '02';
  seconds = '48';
  private countdownSub?: Subscription;

  // modern captcha (image captcha like your template)
  captchaAnswer = 'A7K2';
  captchaInput = '';
  captchaDataUrl = '';
  backgroundImage: string = 'assets/login-back.jpg';

  constructor(private cdn: ChangeDetectorRef) {}

  ngOnInit() {
    this.applyLanguageDir(this.selectedLanguage);

    this.themeSub = this.themeService.theme$.subscribe(t => {
      this.theme = t;
      // ensure modern captcha exists when switching
      if (this.theme === 'modern') this.refreshCaptcha();
    });

    // init captcha for modern
    this.refreshCaptcha();
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  // THEME CHANGE (BehaviorSubject)
  changeTheme(t: ThemeName) {
    this.themeService.setTheme(t);
  }

  changeLanguage() {
    this.applyLanguageDir(this.selectedLanguage);
  }

  private applyLanguageDir(code: string) {
    const lang = this.languageCodeValue.find(l => l.code === code);
    this.dir = lang?.dir ?? 'ltr';
  }

  // DEFAULT/GOVT captcha checkbox
  toggleCaptcha(checked: boolean) {
    this.captchaChecked = checked;
  }

  // MODERN captcha image
  refreshCaptcha() {
    const pool = ['A7K2', 'Q9M4', 'B3T8', 'X2R6', 'H5P1'];
    this.captchaAnswer = pool[Math.floor(Math.random() * pool.length)];
    this.captchaInput = '';

    // Create a simple SVG image as DataURL (hardcoded, no API)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="170" height="40">
        <rect width="170" height="40" fill="#f3f4f6"/>
        <path d="M0,30 C30,10 60,45 90,22 C120,0 150,40 170,20" stroke="#cbd5e1" stroke-width="2" fill="none"/>
        <text x="18" y="27" font-size="20" font-family="Arial" font-weight="700" fill="#111827">${this.captchaAnswer}</text>
      </svg>
    `.trim();

    const encoded = btoa(unescape(encodeURIComponent(svg)));
    this.captchaDataUrl = `data:image/svg+xml;base64,${encoded}`;
  }

  // validation
  get canSendOtpDefaultGovt(): boolean {
    return this.contact.trim().length > 0 && this.captchaChecked;
  }

  get canSendOtpModern(): boolean {
    return this.contact.trim().length > 0 && this.captchaChecked;
  }  

  get canVerify(): boolean {
    return this.otp.trim().length === 4;
  }

  // actions
  sendOtp() {
    this.stage = 'otp';
    this.otp = '';
    this.startCountdownFrom(2, 48);
  }

  verifyOtp() {
    if (!this.canVerify) return;

    // hardcoded OTP success
    if (this.otp !== '1111') {
      const ref = this.dialog.open(ConfirmModal, {
        width: '560px',
        data: {
          title: 'Error',
          heading: 'Wrong OTP',
          message: 'Please enter the correct OTP sent to your contact number.',
          type: 'error',
          confirmText: 'Ok',
          // cancelText: 'No',
          showCancel: true
        }
      })
      ref.afterClosed().subscribe(res => {
        this.otp = '';
        this.cdn.detectChanges();
      });
    } else {
      this.themeService.loggedIn(true);
      this.router.navigateByUrl('/demographic');
    }
  }

  backToContact() {
    this.countdownSub?.unsubscribe();
    this.stage = 'contact';
    this.otp = '';
    this.minutes = '02';
    this.seconds = '48';
  }

  private startCountdownFrom(mm: number, ss: number) {
    this.countdownSub?.unsubscribe();
    let remaining = mm * 60 + ss;
    this.setTime(remaining);

    this.countdownSub = timer(0, 1000).subscribe(() => {
      remaining -= 1;
      if (remaining <= 0) {
        this.backToContact();
        return;
      }
      this.setTime(remaining);
    });
  }

  private setTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    this.minutes = mins < 10 ? '0' + mins : '' + mins;
    this.seconds = secs < 10 ? '0' + secs : '' + secs;
  }
}
