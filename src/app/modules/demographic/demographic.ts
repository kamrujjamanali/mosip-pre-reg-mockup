import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { SelectLanguaeModal } from '../../shared/select-languae-modal/select-languae-modal';
import { TermsModalComponent } from '../../shared/terms-modal/terms-modal';
import { ThemeName, ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';


type Option = { code: string; label: string };

type DocItem = {
  key: string;
  title: string;
  required: boolean;
  docType?: string;
  refId?: string;
  fileName?: string;
  fileUrl?: string; // object URL
};

type PreviewKind = 'pdf' | 'image' | 'none';

type Centre = {
  id: string;
  name: string;
  addressLine: string;
  contactName?: string;
  contactPhone?: string;
  timingText?: string;  // "Timing : 09:00 am - 5:00 pm"
  lunchText?: string;   // "Lunch : 1:00 pm - 2:00 pm"
  openDaysText?: string; // "Open: MON, TUE, WED, THU, FRI"
  lat: number;
  lng: number;
};

type BookingDay = {
  id: string;
  date: Date;
  availableCount: number; // e.g. 56
};

type BookingSlot = {
  id: string;
  start: string; // "09:00"
  end: string;   // "09:15"
  available: number; // e.g. 2
  session: 'morning' | 'afternoon';
};

type Applicant = {
  id: string;
  name: string;
  expanded?: boolean;
};

@Component({
  selector: 'app-demographic',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './demographic.html',
  styleUrl: './demographic.scss',
})
export class DemographicComponent {
  private readonly themeService = inject(ThemeService);
  theme: ThemeName = 'default';
  themes = this.themeService.themes;
  private readonly sanitizer = inject(DomSanitizer);

  private sub?: Subscription;

  // 0 = demographic, 1 = upload
  activeStepIndex = 0;

  /** ✅ Preview inside upload step */
  isUploadPreview = false;

  // screen label
  dataCaptureLanguage = 'English';

  // ---------------------------
  // Hardcoded St Vincent data
  // ---------------------------
  genders: Option[] = [
    { code: 'M', label: 'Male' },
    { code: 'F', label: 'Female' },
    { code: 'O', label: 'Other' },
  ];

  residenceStatuses: Option[] = [
    { code: 'FOREIGNER', label: 'Foreigner' },
    { code: 'NON_FOREIGNER', label: 'Non-Foreigner' },
  ];  

  regions: Option[] = [
    { code: 'MAIN', label: 'St. Vincent (Mainland)' },
    { code: 'GREN', label: 'Grenadines' },
  ];

  // Province -> Parishes
  parishes: Option[] = [
    { code: 'CHA', label: 'Charlotte' },
    { code: 'GRE', label: 'Grenadines' },
    { code: 'AND', label: 'Saint Andrew' },
    { code: 'DAV', label: 'Saint David' },
    { code: 'GEO', label: 'Saint George' },
    { code: 'PAT', label: 'Saint Patrick' },
  ];

  citiesByParish: Record<string, Option[]> = {
    CHA: [
      { code: 'GEO', label: 'Georgetown' },
      { code: 'BYR', label: 'Byera' },
      { code: 'OWI', label: 'Owia' },
    ],
    GRE: [
      { code: 'BQT', label: 'Bequia' },
      { code: 'UNI', label: 'Union Island' },
      { code: 'CAN', label: 'Canouan' },
    ],
    AND: [
      { code: 'LAY', label: 'Layou' },
      { code: 'TRO', label: 'Troumaca' },
    ],
    DAV: [
      { code: 'CHB', label: 'Chateaubelair' },
      { code: 'RIC', label: 'Richland Park' },
    ],
    GEO: [
      { code: 'KIN', label: 'Kingstown' },
      { code: 'CAL', label: 'Calliaqua' },
    ],
    PAT: [
      { code: 'BAR', label: 'Barrouallie' },
      { code: 'SPR', label: 'Spring Village' },
    ],
  };

  zones: Option[] = [
    { code: 'N', label: 'North' },
    { code: 'C', label: 'Central' },
    { code: 'S', label: 'South' },
    { code: 'G', label: 'Grenadines' },
  ];

  postalCodes: Option[] = [
    { code: 'VC0100', label: 'VC0100 (Kingstown)' },
    { code: 'VC0200', label: 'VC0200 (Calliaqua)' },
    { code: 'VC0300', label: 'VC0300 (Georgetown)' },
    { code: 'VC0400', label: 'VC0400 (Barrouallie)' },
    { code: 'VC0500', label: 'VC0500 (Bequia)' },
  ];

  // ---------------------------
  // Demographic model (ALL FIELDS)
  // ---------------------------
  fullName = '';
  dob = '';
  age = '';
  years = '';

  gender = '';
  residenceStatus = '';

  address = '';
  region = '';
  parish = '';
  city = '';
  zone = '';

  postalCode = '';
  phone = '';
  email = '';

  // ---------------------------
  // Upload screen model
  // ---------------------------
  allowedTypes = 'pdf, jpeg, png, jpg';
  maxSizeText = '10mb';

  docTypesIdentity: Option[] = [
    { code: 'NID', label: 'National ID' },
    { code: 'PAS', label: 'Passport' },
    { code: 'DL', label: 'Driver’s Licence' },
  ];

  docTypesAddress: Option[] = [
    { code: 'UTIL', label: 'Utility Bill' },
    { code: 'BANK', label: 'Bank Statement' },
    { code: 'LEASE', label: 'Lease Agreement' },
  ];

  docTypesRelationship: Option[] = [
    { code: 'MARR', label: 'Marriage Certificate' },
    { code: 'BIRT', label: 'Birth Certificate (Parent/Child)' },
    { code: 'AFF', label: 'Affidavit' },
  ];

  docTypesDob: Option[] = [
    { code: 'BIRT', label: 'Birth Certificate' },
    { code: 'PAS', label: 'Passport' },
  ];

  documents: DocItem[] = [
    { key: 'id', title: 'Identity Proof', required: true },
    { key: 'addr', title: 'Address Proof', required: false },
    { key: 'rel', title: 'Relationship Proof', required: true },
    { key: 'dob', title: 'DOB Proof', required: true },
  ];

  // Preview
  previewKind: PreviewKind = 'none';
  selectedPreviewTitle = '';
  safePdfUrl: SafeResourceUrl | null = null;
  safeImgUrl: SafeUrl | null = null;

  bookTab: 'recommended' | 'nearby' = 'recommended';

  centres: Centre[] = [
    {
      id: 'vc-kingstown',
      name: 'Kingstown Registration Centre',
      addressLine: 'Bay Street, Kingstown, St. Vincent',
      contactName: 'Registration Officer',
      contactPhone: '784-456-1234',
      timingText: 'Timing : 08:30 am - 4:30 pm',
      lunchText: 'Lunch : 12:30 pm - 1:30 pm',
      openDaysText: 'Open: MON, TUE, WED, THU, FRI',
      lat: 13.1579,
      lng: -61.2248
    },
    {
      id: 'vc-calliaqua',
      name: 'Calliaqua Community Centre',
      addressLine: 'Main Road, Calliaqua, St. Vincent',
      contactName: 'Community Officer',
      contactPhone: '784-456-2345',
      timingText: 'Timing : 09:00 am - 5:00 pm',
      lunchText: 'Lunch : 1:00 pm - 2:00 pm',
      openDaysText: 'Open: MON, TUE, THU, FRI',
      lat: 13.1295,
      lng: -61.1977
    }
  ];
  
  selectedCentreId = this.centres[0]?.id ?? '';

  bookingDays: BookingDay[] = [];
  selectedDayIndex = 0;

  bookingSlots: BookingSlot[] = [];
  selectedSession: 'morning' | 'afternoon' = 'morning';

  selectedSlotId: string | null = null;

  applicants: Applicant[] = [
    { id: 'a2', name: 'Applicant 2', expanded: false },
  ];
  selectedApplicantId: string | null = null;


  // ---------------------------
// CONFIRMATION (Step 3)
// ---------------------------
applicationId = '57617601607359';
appointmentDateTimeText = '19 Dec 2025, 9:15 AM';
centerContactNumber = '745360421';

confirmName = 'John Doe';
confirmCenterName = 'Center Agdal';

// QR value (string used to encode QR)
qrValue = `APP:${this.applicationId}|DT:${this.appointmentDateTimeText}|CENTER:${this.confirmCenterName}`;

// guidelines line
guidelinesText =
  '1. Guideline 1 2. Guideline 2 3. Guideline 3 4. Guideline 4 5. Guideline 5 6. Guideline 6 7. Guideline 7 8. Guideline 8 9. Guideline 9 10. Guideline 10';


  constructor(private dialog: MatDialog, private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe((t) => (this.theme = t));
    this.openLanguageModal();
    this.initBookingMock();
  }

  openLanguageModal() {
    const ref = this.dialog.open(TermsModalComponent, {
      width: '60%',
      disableClose: true,
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.documents.forEach((d) => d.fileUrl && URL.revokeObjectURL(d.fileUrl));
  }

  // navigation
  goToDemographic() {
    this.activeStepIndex = 0;
    this.isUploadPreview = false;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToUpload() {
    this.activeStepIndex = 1;
    this.isUploadPreview = false;
  }

   // when user finishes preview -> go next step (Book Appointment)
  goToBookAppointment() {
    this.activeStepIndex = 2;
    this.isUploadPreview = false;
  }

  // -------------------------
  // ✅ Upload -> Preview (same step)
  // -------------------------
  openUploadPreview() {
    this.isUploadPreview = true; // stepper stays on Upload
  }

  backToUploadEdit() {
    this.isUploadPreview = false;
  }

  continueFromPreview() {
    // NOW stepper should move to next step
    this.goToBookAppointment();
    // this.goToDashboard();
  }

  // -------------------------
  // ✅ Preview helpers
  // -------------------------
  get dobPreviewText(): string {
    const v: any = this.dob;
    if (!v) return '';
    try {
      const d = v instanceof Date ? v : new Date(v);
      if (isNaN(d.getTime())) return String(v);
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return String(v);
    }
  }

  labelOf(list: Option[], code: string): string {
    return list.find(x => x.code === code)?.label ?? code ?? '';
  }

  get genderLabel(): string { return this.labelOf(this.genders, this.gender); }
  get residenceLabel(): string { return this.labelOf(this.residenceStatuses, this.residenceStatus); }
  get regionLabel(): string { return this.labelOf(this.regions, this.region); }
  get parishLabel(): string { return this.labelOf(this.parishes, this.parish); }
  get cityLabel(): string { return this.labelOf(this.cities, this.city); }
  get zoneLabel(): string { return this.labelOf(this.zones, this.zone); }
  get postalLabel(): string { return this.labelOf(this.postalCodes, this.postalCode); }

  onParishChange() {
    this.city = '';
  }

  get cities(): Option[] {
    return this.citiesByParish[this.parish] ?? [];
  }

  changeDataCaptureLanguages() {
    this.openLanguageModal();
  }

  getDocTypeOptions(docKey: string): Option[] {
    switch (docKey) {
      case 'id':
        return this.docTypesIdentity;
      case 'addr':
        return this.docTypesAddress;
      case 'rel':
        return this.docTypesRelationship;
      case 'dob':
        return this.docTypesDob;
      default:
        return [];
    }
  }

  browseFile(_: DocItem, input: HTMLInputElement) {
    input.click();
  }

  onFileSelected(doc: DocItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // cleanup old URL
    if (doc.fileUrl) URL.revokeObjectURL(doc.fileUrl);

    doc.fileName = file.name;
    doc.fileUrl = URL.createObjectURL(file);

    // auto preview
    this.preview(doc);
    input.value = '';
  }

  preview(doc: DocItem) {
    if (!doc.fileUrl) return;

    this.selectedPreviewTitle = doc.title;

    // decide pdf or image using filename
    const name = (doc.fileName || '').toLowerCase();
    const isPdf = name.endsWith('.pdf');
    const isImg =
      name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp');

    this.safePdfUrl = null;
    this.safeImgUrl = null;

    if (isPdf) {
      this.previewKind = 'pdf';
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
    } else if (isImg) {
      this.previewKind = 'image';
      this.safeImgUrl = this.sanitizer.bypassSecurityTrustUrl(doc.fileUrl);
    } else {
      // fallback to iframe
      this.previewKind = 'pdf';
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.fileUrl);
    }
  }

  remove(doc: DocItem) {
    this.dialog.open(ConfirmModal, {
      width: '560px',
      data: {
        title: 'CONFIRMATION',
        heading: 'Are you sure you want to delete?',
        message: 'This action will permanently delete the selected document.',
        type: 'warning',
        confirmText: 'Yes',
        cancelText: 'No',
        showCancel: true
      }
    }).afterClosed().subscribe(res => {
      if (res?.confirmed) {
        if (doc.fileUrl) URL.revokeObjectURL(doc.fileUrl);
        doc.fileUrl = undefined;
        doc.fileName = undefined;
        if (this.selectedPreviewTitle === doc.title) {
          this.selectedPreviewTitle = '';
          this.previewKind = 'none';
          this.safePdfUrl = null;
          this.safeImgUrl = null;
        }
        this.cdr.detectChanges();
      }
    });
  }

  get selectedCentre(): Centre | undefined {
    return this.centres.find(c => c.id === this.selectedCentreId);
  }
  
  // Map iframe url (OpenStreetMap embed)
  get mapEmbedUrl(): SafeResourceUrl | null {
    const c = this.selectedCentre;
    if (!c) return null;
    const d = 0.02;
    const left = c.lng - d;
    const right = c.lng + d;
    const top = c.lat + d;
    const bottom = c.lat - d;
  
    const url =
      `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}` +
      `&layer=mapnik&marker=${c.lat}%2C${c.lng}`;
  
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  
  // Book appointment actions (wire as you like)
  bookBack() {
    this.activeStepIndex = 1;
    this.isUploadPreview = false;
  }
  
  bookLater() {
    this.goToDashboard();
  }
  
  selectSlots: boolean = false;
  bookContinue() {
    // this.goToDashboard();
    this.selectSlots = true;
  }

  continueAfterSlotSelection() {
    // this.goToDashboard();
    this.goToConfirmation();
    this.selectSlots = false;
  }

  backFromSlotSelection() {
    this.selectSlots = false;
  }

  initBookingMock() {
    // create 3 days like screenshot
    const base = new Date();
    base.setHours(0, 0, 0, 0);
  
    this.bookingDays = [
      { id: 'd1', date: new Date(base.getTime() + 1 * 24 * 60 * 60 * 1000), availableCount: 56 },
      { id: 'd2', date: new Date(base.getTime() + 4 * 24 * 60 * 60 * 1000), availableCount: 56 },
      { id: 'd3', date: new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000), availableCount: 56 },
    ];
  
    this.selectedDayIndex = 0;
    this.selectedSession = 'morning';
    this.selectedSlotId = null;
  
    this.bookingSlots = this.buildSlots();
  }
  
  buildSlots(): BookingSlot[] {
    // screenshot-style: 15 min slots (09:00 -> 13:00) morning
    const slots: BookingSlot[] = [];
    const make = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  
    // morning: 09:00 to 13:00
    let h = 9, m = 0;
    while (!(h === 13 && m === 0)) {
      const start = make(h, m);
      m += 15;
      if (m >= 60) { h++; m = 0; }
      const end = make(h, m);
      slots.push({
        id: `m-${start}`,
        start,
        end,
        available: 2,
        session: 'morning'
      });
    }
  
    // afternoon: example 13:00 -> 17:00
    h = 13; m = 0;
    while (!(h === 17 && m === 0)) {
      const start = make(h, m);
      m += 15;
      if (m >= 60) { h++; m = 0; }
      const end = make(h, m);
      slots.push({
        id: `a-${start}`,
        start,
        end,
        available: 2,
        session: 'afternoon'
      });
    }
  
    return slots;
  }
  
  get visibleDays(): BookingDay[] {
    // keep exactly 3 visible like screenshot
    return this.bookingDays.slice(0, 3);
  }
  
  selectDay(i: number) {
    this.selectedDayIndex = i;
    this.selectedSlotId = null;
  }
  
  prevDays() {
    // demo only: you can implement paging from API later
  }
  
  nextDays() {
    // demo only: you can implement paging from API later
  }
  
  setSession(s: 'morning' | 'afternoon') {
    this.selectedSession = s;
    this.selectedSlotId = null;
  }
  
  get filteredSlots(): BookingSlot[] {
    return this.bookingSlots.filter(s => s.session === this.selectedSession);
  }
  
  selectSlot(slot: BookingSlot) {
    if (slot.available <= 0) return;
    this.selectedSlotId = slot.id;
  }
  
  toggleApplicant(a: Applicant) {
    a.expanded = !a.expanded;
  }
  
  selectApplicant(a: Applicant) {
    this.selectedApplicantId = a.id;
  }
  
  fmtDay(d: Date): string {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  }
  fmtWeekday(d: Date): string {
    return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(d);
  }
  
  get canContinueBooking(): boolean {
    return !!this.selectedSlotId && !!this.selectedApplicantId;
  }

  // navigation
goToConfirmation() {
  this.activeStepIndex = 3;
  this.isUploadPreview = false;
}

// actions (wire later)
sendEmailSms() {
  // integrate API later
  console.log('sendEmailSms');
}
downloadPdf() {
  console.log('downloadPdf');
}
printConfirmation() {
  window.print();
}

  changeTheme(t: ThemeName) {
    this.themeService.setTheme(t);
  }
}