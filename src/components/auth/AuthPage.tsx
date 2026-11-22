import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { inAppBrowser, phoneOs, continueInRealBrowser, restoreHandoff, showHandoffInAddress } from '@/lib/inAppBrowser';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AuthPage = () => {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState('');

  const readJson = (key: string) => {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; }
  };
  const [ffrState, setFfrState] = useState<{ score: number; retirementYear?: number; gap?: number } | null>(() => readJson('ffr_pending_state'));
  const [blogContext, setBlogContext] = useState<{ title: string } | null>(() => readJson('auth_context_blog'));
  const [isConsultation, setIsConsultation] = useState(() => sessionStorage.getItem('auth_context_consultation') === 'true');

  // Inside Instagram / Facebook: Google asks for the password there, so we
  // offer to continue in Chrome or Safari, where it's one tap
  const [inApp] = useState(() => inAppBrowser());
  const [showManualSteps, setShowManualSteps] = useState(false);
  const handoffId = searchParams.get('handoff');
  // A handoff that this page saved but the real browser hasn't picked up yet
  const [pendingHandoff, setPendingHandoff] = useState<string | null>(inApp ? handoffId : null);
  const [restoring, setRestoring] = useState(!!handoffId && !inApp);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      localStorage.setItem('pending_referral_code', refCode);
      toast({ title: 'Referral code applied!', description: `You're signing up with referral code: ${refCode}` });
    }
  }, [searchParams, toast]);

  // Arrived from the app's browser: put back the visitor's score and numbers,
  // then go straight to Google (one tap, the phone's account is known here)
  useEffect(() => {
    if (!handoffId || user) { setRestoring(false); return; }
    // Opened inside Instagram / Facebook again (e.g. the Android fallback):
    // leave the handoff for the real browser and show the manual steps
    if (inApp) { setShowManualSteps(true); return; }
    let cancelled = false;
    restoreHandoff(handoffId).then((ok) => {
      if (cancelled) return;
      setFfrState(readJson('ffr_pending_state'));
      setBlogContext(readJson('auth_context_blog'));
      setIsConsultation(sessionStorage.getItem('auth_context_consultation') === 'true');
      if (ok) handleGoogleSignIn();
      else setRestoring(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handoffId]);

  if (user) {
    const redirectPath = localStorage.getItem('redirect_after_login');
    if (redirectPath) {
      localStorage.removeItem('redirect_after_login');
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  async function handleGoogleSignIn() {
    // Determine lead source — specific on-site context takes priority over UTM.
    // Read fresh: a handoff from the app's browser may have just restored it.
    let leadSource: string;
    if (sessionStorage.getItem('ffr_pending_state')) {
      leadSource = 'Calculator';
    } else if (sessionStorage.getItem('auth_context_consultation') === 'true') {
      leadSource = 'Consultation CTA';
    } else if (sessionStorage.getItem('auth_context_blog')) {
      leadSource = 'Blog Article';
    } else {
      // Fall back to UTM source captured from the URL they arrived on
      leadSource = localStorage.getItem('utm_source') || 'Website Signup';
    }
    localStorage.setItem('pending_lead_source', leadSource);

    setLoading(true);
    await signInWithGoogle(referralCode || localStorage.getItem('pending_referral_code') || undefined);
    setLoading(false);
  }

  const handleContinueInBrowser = async () => {
    setLoading(true);
    const { left, id } = await continueInRealBrowser(pendingHandoff);
    setLoading(false);
    if (!left) {
      if (id) { setPendingHandoff(id); showHandoffInAddress(id); }
      setShowManualSteps(true);
    }
  };

  const browserName = phoneOs() === 'ios' ? 'Safari' : 'Chrome';

  if (restoring) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ui-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p style={{ fontSize: 15, color: 'var(--ui-text-muted)' }}>Signing you in with Google…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ui-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--ui-surface)',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        padding: 48,
        textAlign: 'center',
      }}>
        {/* Logo: dark-text version on light, light-text version on dark */}
        <img
          src="/images/black-logo-Photoroom.png"
          alt="Vinca Wealth"
          className="dark:hidden"
          style={{ height: 40, width: 'auto', maxWidth: 200, objectFit: 'contain', margin: '0 auto 24px' }}
        />
        <img
          src="/lovable-uploads/85ed6dc8-bea0-4bcf-bda4-506f3f06325a.png"
          alt="Vinca Wealth"
          className="hidden dark:block"
          style={{ height: 40, width: 'auto', maxWidth: 200, objectFit: 'contain', margin: '0 auto 24px' }}
        />

        {/* Context-aware heading block */}
        {ffrState ? (
          <>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--ui-green-bg)',
              border: '1px solid var(--ui-green-line)',
              borderRadius: 100,
              padding: '8px 20px',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(158 64% 32%)' }}>
                Your score: {ffrState.score}/100
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>
              {ffrState.retirementYear
                ? `See exactly how to retire by ${ffrState.retirementYear}`
                : 'Sign in to see your full plan'}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ui-text-muted)', marginBottom: 32, lineHeight: 1.5 }}>
              Your numbers are saved. Unlock your month-by-month action plan.
            </p>
          </>
        ) : isConsultation ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>
              Book your free consultation
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ui-text-muted)', marginBottom: 32, lineHeight: 1.5 }}>
              Sign in to schedule a call with a dedicated wealth manager. No commitment, no sales pitch.
            </p>
          </>
        ) : blogContext ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>
              Calculate your Financial Freedom Score
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ui-text-muted)', marginBottom: 32, lineHeight: 1.5 }}>
              You were reading <em>"{blogContext.title.replace(' | Vinca Wealth', '').replace(' - Vinca Wealth', '')}"</em>. Sign in to find out exactly where you stand — free, in 2 minutes.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>
              Are you on track to retire when you want?
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ui-text-muted)', marginBottom: 32, lineHeight: 1.5 }}>
              Find out your Financial Freedom Score in 2 minutes. Free.
            </p>
          </>
        )}

        {/* Google button */}
        <button
          onClick={inApp ? handleContinueInBrowser : handleGoogleSignIn}
          disabled={loading}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%',
            background: 'var(--ui-surface)',
            border: `1px solid ${hovered ? 'var(--ui-text-faint)' : 'var(--ui-line)'}`,
            borderRadius: 12,
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: 15,
            color: 'var(--ui-text)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {inApp && (
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--ui-text-muted)', lineHeight: 1.5 }}>
            {showManualSteps ? (
              <p style={{ background: 'var(--ui-green-bg)', border: '1px solid var(--ui-green-line)', borderRadius: 12, padding: '12px 14px', color: 'var(--ui-text)', textAlign: 'left' }}>
                Tap <strong>{phoneOs() === 'ios' ? '•••' : '⋮'}</strong> at the top right and choose{' '}
                <strong>Open in {phoneOs() === 'ios' ? 'external browser' : browserName}</strong>, then tap Continue with Google there.
              </p>
            ) : (
              <p>Opens {browserName}, where Google signs you in with one tap. Your numbers come with you.</p>
            )}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--ui-text-muted)', textDecoration: 'underline', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Or sign in here with your Google password
            </button>
          </div>
        )}

        {/* Footer */}
        <p style={{ fontSize: 12, color: 'var(--ui-text-faint)', marginTop: 32 }}>
          100% free. No spam. We never share your details.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
