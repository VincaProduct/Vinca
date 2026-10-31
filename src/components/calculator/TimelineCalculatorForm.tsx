import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalculatorInputs } from '@/types/calculator';
import { Loader2 } from 'lucide-react';

const MIN_AGE = 18;
const MAX_AGE = 80;

interface TimelineCalculatorFormProps {
  inputs: CalculatorInputs;
  onInputChange: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--ui-surface)',
  border: '2px solid var(--ui-line)',
  borderRadius: 12,
  padding: '16px 20px',
  fontSize: 18,
  fontWeight: 600,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: 'var(--ui-text)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--ui-text-body)',
  marginBottom: 8,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const helperStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--ui-text-faint)',
  marginTop: 6,
};

interface FocusableInputProps {
  label: string;
  value: number | string;
  onChange: (val: string) => void;
  placeholder?: string;
  prefix?: string;
  helper?: string;
  /** Shown instead of the helper, in red */
  error?: string;
  type?: string;
  min?: number;
  step?: number;
}

function FocusableInput({ label, value, onChange, placeholder, prefix, helper, error, type = 'number', min = 0, step }: FocusableInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, fontWeight: 600, color: 'var(--ui-text-body)', pointerEvents: 'none',
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          step={step}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            paddingLeft: prefix ? 36 : 20,
            borderColor: error ? 'hsl(0 72% 55%)' : focused ? 'hsl(158 64% 52%)' : 'var(--ui-line)',
            boxShadow: focused ? '0 0 0 4px hsl(158 64% 52% / 0.1)' : 'none',
          }}
        />
      </div>
      {error
        ? <p style={{ ...helperStyle, color: 'hsl(0 72% 55%)' }}>{error}</p>
        : helper && <p style={helperStyle}>{helper}</p>}
    </div>
  );
}

const TimelineCalculatorForm: React.FC<TimelineCalculatorFormProps> = ({
  inputs,
  onInputChange,
  onCalculate,
}) => {
  const [step, setStep] = useState(0);
  const [calculating, setCalculating] = useState(false);

  // Typed as free text so any age can be entered; the inputs are only updated
  // with it once it's a valid retirement age
  const [retirementText, setRetirementText] = useState(() =>
    inputs.age > 0 ? String(inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP) : '');
  const retirementAge = Number(retirementText) || 0;

  // How long SIPs run, as the calculator has always assumed (20 years by
  // default); remembered so a short retirement horizon doesn't shrink it for good
  const [sipLength] = useState(() => Math.max(inputs.yearsForSIP, 1));

  /** SIP years and waiting years for a retirement age: SIPs run for their usual
      length, or stop at retirement if that comes first; the corpus then waits */
  const splitYears = (age: number, retireAt: number) => {
    const years = Math.max(0, retireAt - age);
    const sipYears = Math.min(sipLength, years);
    return { yearsForSIP: sipYears, waitingYearsBeforeSWP: years - sipYears };
  };

  const ageValid = inputs.age >= MIN_AGE && inputs.age <= MAX_AGE;
  const retirementValid = retirementAge > inputs.age && retirementAge < inputs.lifeExpectancy;

  const handleChange = (field: keyof CalculatorInputs, value: string) => {
    const num = value === '' ? 0 : Number(value);
    if (!isNaN(num) && num >= 0) {
      onInputChange({ ...inputs, [field]: num });
    }
  };

  const handleAge = (value: string) => {
    const age = value === '' ? 0 : Number(value);
    if (isNaN(age) || age < 0) return;
    // Keep the chosen retirement age when the current age changes
    const next = { ...inputs, age };
    if (retirementAge > age) Object.assign(next, splitYears(age, retirementAge));
    onInputChange(next);
  };

  const handleRetirementAge = (value: string) => {
    if (!/^\d{0,3}$/.test(value)) return;
    setRetirementText(value);
    const retireAt = Number(value);
    if (retireAt > inputs.age && retireAt < inputs.lifeExpectancy) {
      onInputChange({ ...inputs, ...splitYears(inputs.age, retireAt) });
    }
  };

  // Errors wait for a second digit, so they don't flash up mid-typing
  const ageError = inputs.age >= 10 && !ageValid ? `Enter an age between ${MIN_AGE} and ${MAX_AGE}` : undefined;
  const retirementError = retirementText.length >= 2 && ageValid && !retirementValid
    ? `Enter an age above ${inputs.age} and below ${inputs.lifeExpectancy}`
    : undefined;

  const step1Valid = ageValid && retirementValid && inputs.currentMonthlyExpenses > 0;
  const step2Valid = inputs.sipAmount > 0;

  const handleCalculate = async () => {
    setCalculating(true);
    await new Promise(r => setTimeout(r, 800));
    onCalculate();
    setCalculating(false);
  };

  const progressPct = step === 0 ? 50 : 100;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 520, margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(158 64% 42%)' }}>
            Step {step + 1} of 2
          </span>
          <span style={{ fontSize: 13, color: 'var(--ui-text-faint)' }}>
            {step === 0 ? 'Basic details' : 'Your investments'}
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--ui-line)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'hsl(158 64% 52%)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <FocusableInput
            label="How old are you?"
            value={inputs.age}
            onChange={handleAge}
            placeholder="e.g. 30"
            error={ageError}
          />
          <FocusableInput
            label="When do you want to retire?"
            value={retirementText}
            onChange={handleRetirementAge}
            placeholder="e.g. 55"
            helper="The age you'd like to stop working"
            error={retirementError}
          />
          <FocusableInput
            label="What are your monthly expenses?"
            value={inputs.currentMonthlyExpenses}
            onChange={v => handleChange('currentMonthlyExpenses', v)}
            placeholder="50000"
            prefix="₹"
            helper="Include rent, food, utilities — everything you spend today"
          />

          <Button
            onClick={() => setStep(1)}
            disabled={!step1Valid}
            size="lg"
            style={{
              width: '100%',
              borderRadius: 12,
              padding: '16px 32px',
              fontWeight: 600,
              fontSize: 16,
              height: 'auto',
              marginTop: 8,
              transition: 'all 0.2s ease',
            }}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <FocusableInput
            label="What is your current monthly SIP?"
            value={inputs.sipAmount}
            onChange={v => handleChange('sipAmount', v)}
            placeholder="25000"
            prefix="₹"
            helper="Total amount you invest in mutual funds every month"
          />
          <FocusableInput
            label="What is your existing investment corpus?"
            value={inputs.initialPortfolioValue}
            onChange={v => handleChange('initialPortfolioValue', v)}
            placeholder="500000"
            prefix="₹"
            helper="Include mutual funds, FDs, stocks, PPF"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button
              onClick={handleCalculate}
              disabled={!step2Valid || calculating}
              size="lg"
              style={{
                width: '100%',
                borderRadius: 12,
                padding: '16px 32px',
                fontWeight: 600,
                fontSize: 16,
                height: 'auto',
                transition: 'all 0.2s ease',
              }}
            >
              {calculating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                  Calculating...
                </span>
              ) : 'Calculate My Score →'}
            </Button>
            <button
              onClick={() => setStep(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, color: 'var(--ui-text-faint)', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TimelineCalculatorForm;
