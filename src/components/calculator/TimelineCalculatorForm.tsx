import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalculatorInputs } from '@/types/calculator';
import { Loader2 } from 'lucide-react';

interface TimelineCalculatorFormProps {
  inputs: CalculatorInputs;
  onInputChange: (inputs: CalculatorInputs) => void;
  onCalculate: () => void;
}

const inputStyle: React.CSSProperties = {
  background: 'white',
  border: '2px solid #E5E7EB',
  borderRadius: 12,
  padding: '16px 20px',
  fontSize: 18,
  fontWeight: 600,
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: '#111827',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 8,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const helperStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9CA3AF',
  marginTop: 6,
};

interface FocusableInputProps {
  label: string;
  value: number | string;
  onChange: (val: string) => void;
  placeholder?: string;
  prefix?: string;
  helper?: string;
  type?: string;
  min?: number;
  step?: number;
}

function FocusableInput({ label, value, onChange, placeholder, prefix, helper, type = 'number', min = 0, step }: FocusableInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, fontWeight: 600, color: '#374151', pointerEvents: 'none',
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
            borderColor: focused ? 'hsl(158 64% 52%)' : '#E5E7EB',
            boxShadow: focused ? '0 0 0 4px hsl(158 64% 52% / 0.1)' : 'none',
          }}
        />
      </div>
      {helper && <p style={helperStyle}>{helper}</p>}
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

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  const handleChange = (field: keyof CalculatorInputs, value: string) => {
    const num = value === '' ? 0 : Number(value);
    if (!isNaN(num) && num >= 0) {
      onInputChange({ ...inputs, [field]: num });
    }
  };

  const handleRetirementAge = (value: string) => {
    const age = Number(value);
    if (!isNaN(age) && age > 0) {
      const waiting = Math.max(0, age - (inputs.age + inputs.yearsForSIP));
      onInputChange({ ...inputs, waitingYearsBeforeSWP: waiting });
    }
  };

  const step1Valid = inputs.age > 0 && inputs.currentMonthlyExpenses > 0 && retirementAge >= inputs.age;
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
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>
            {step === 0 ? 'Basic details' : 'Your investments'}
          </span>
        </div>
        <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
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
            onChange={v => handleChange('age', v)}
            placeholder="e.g. 30"
          />
          <FocusableInput
            label="When do you want to retire?"
            value={retirementAge || ''}
            onChange={handleRetirementAge}
            placeholder="e.g. 55"
            helper="The age you'd like to stop working"
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

          {/* Preview card */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '16px 20px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'hsl(158 64% 52%)',
                  display: 'inline-block',
                  animation: `dotPulse 1.2s ease-in-out infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Based on your inputs, your score will be ready in seconds.
            </p>
          </div>

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
                fontSize: 14, color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TimelineCalculatorForm;
