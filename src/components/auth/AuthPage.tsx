import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const [ffrState] = useState<{ score: number; retirementYear?: number; gap?: number } | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('ffr_pending_state') || 'null'); } catch { return null; }
  });
  const [blogContext] = useState<{ title: string } | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('auth_context_blog') || 'null'); } catch { return null; }
  });
  const [isConsultation] = useState(() => sessionStorage.getItem('auth_context_consultation') === 'true');

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      localStorage.setItem('pending_referral_code', refCode);
      toast({ title: 'Referral code applied!', description: `You're signing up with referral code: ${refCode}` });
    }
  }, [searchParams, toast]);

  if (user) {
    const redirectPath = localStorage.getItem('redirect_after_login');
    if (redirectPath) {
      localStorage.removeItem('redirect_after_login');
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSignIn = async () => {
    // Determine lead source — specific on-site context takes priority over UTM
    let leadSource: string;
    if (ffrState) {
      leadSource = 'Calculator';
    } else if (isConsultation) {
      leadSource = 'Consultation CTA';
    } else if (blogContext) {
      leadSource = 'Blog Article';
    } else {
      // Fall back to UTM source captured from the URL they arrived on
      leadSource = localStorage.getItem('utm_source') || 'Website Signup';
    }
    localStorage.setItem('pending_lead_source', leadSource);

    setLoading(true);
    await signInWithGoogle(referralCode || undefined);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        padding: 48,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img
          src="/images/black-logo-Photoroom.png"
          alt="Vinca Wealth"
          style={{ height: 40, width: 'auto', maxWidth: 200, objectFit: 'contain', margin: '0 auto 24px' }}
        />

        {/* Context-aware heading block */}
        {ffrState ? (
          <>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 100,
              padding: '8px 20px',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(158 64% 32%)' }}>
                Your score: {ffrState.score}/100
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {ffrState.retirementYear
                ? `See exactly how to retire by ${ffrState.retirementYear}`
                : 'Sign in to see your full plan'}
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.5 }}>
              Your numbers are saved. Unlock your month-by-month action plan.
            </p>
          </>
        ) : isConsultation ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              Book your free consultation
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.5 }}>
              Sign in to schedule a call with a dedicated wealth manager. No commitment, no sales pitch.
            </p>
          </>
        ) : blogContext ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              Calculate your Financial Freedom Score
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.5 }}>
              You were reading <em>"{blogContext.title.replace(' | Vinca Wealth', '').replace(' - Vinca Wealth', '')}"</em>. Sign in to find out exactly where you stand — free, in 2 minutes.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              Are you on track to retire when you want?
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.5 }}>
              Find out your Financial Freedom Score in 2 minutes. Free.
            </p>
          </>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%',
            background: 'white',
            border: `1px solid ${hovered ? '#9CA3AF' : '#E5E7EB'}`,
            borderRadius: 12,
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: 15,
            color: '#111827',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 32 }}>
          No spam. No credit card. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
