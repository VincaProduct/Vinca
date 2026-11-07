import type { NavigateFunction } from 'react-router-dom';

/**
 * Opens a dashboard page: straight there when signed in, otherwise through
 * Google sign-in, landing on that page afterwards
 */
export const openDashboardPage = (navigate: NavigateFunction, signedIn: boolean, url: string) => {
  if (signedIn) {
    navigate(url);
    return;
  }
  localStorage.setItem('redirect_after_login', url);
  navigate('/auth');
};

/** "Talk to our team": sign in, then Compass to book (recorded as a consultation lead) */
export const openConsultation = (navigate: NavigateFunction, signedIn: boolean) => {
  if (!signedIn) sessionStorage.setItem('auth_context_consultation', 'true');
  openDashboardPage(navigate, signedIn, '/dashboard/compass');
};
