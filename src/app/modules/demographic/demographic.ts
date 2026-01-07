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
    { code: 'CIT', label: 'Citizen' },
    { code: 'PR', label: 'Permanent Resident' },
    { code: 'TR', label: 'Temporary Resident' },
    { code: 'VIS', label: 'Visitor' },
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

  constructor(private dialog: MatDialog, private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe((t) => (this.theme = t));
    this.openLanguageModal();
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
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToUpload() {
    this.activeStepIndex = 1;
  }

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

  changeTheme(t: ThemeName) {
    this.themeService.setTheme(t);
  }
}