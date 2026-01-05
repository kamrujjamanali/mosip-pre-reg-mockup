import { Routes } from '@angular/router';
import { DemographicComponent } from './modules/demographic/demographic';
import { LoginComponent } from './modules/login/login';
import { Dashboard } from './modules/dashboard/dashboard';

export const mockAuthGuard = () => {
    // In real app, check if user accepted terms / logged in
    const acceptedTerms = localStorage.getItem('termsAccepted') === 'true';
    return acceptedTerms || true; // For demo, allow access
  };
  
  export const routes: Routes = [
    {
      path: '',
      redirectTo: 'login',
      pathMatch: 'full'
    },
    {
      path: 'login',
      component: LoginComponent
    },
    {
      // All authenticated pages under this layout
      path: '',
      canActivate: [mockAuthGuard],
      children: [
        {
          path: 'demographic',
          component: DemographicComponent,
          data: { title: 'Demographic Details' }
        },
        {
          path: 'dashboard',
          component: Dashboard
        }
        // {
        //   path: 'upload-document',
        //   loadComponent: () => import('./upload-document/upload-document.component').then(m => m.UploadDocumentComponent),
        //   data: { title: 'Upload Document' }
        // },
        // {
        //   path: 'book-appointment',
        //   loadComponent: () => import('./book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent),
        //   data: { title: 'Book Appointment' }
        // },
        // {
        //   path: 'confirmation',
        //   loadComponent: () => import('./confirmation/confirmation.component').then(m => m.ConfirmationComponent),
        //   data: { title: 'Confirmation' }
        // },
        // {
        //   path: 'dashboard',
        //   loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        //   data: { title: 'Dashboard' }
        // },
        // Add more pages here later
      ]
    },
    {
      path: '**',
      redirectTo: 'login'
    }
  ];