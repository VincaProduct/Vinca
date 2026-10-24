import { CALCULATOR_FAQS, CALCULATOR_INFO } from "@/content/siteInfo";

/**
 * How the calculator works, its assumptions and FAQs. The same text is
 * server-rendered for search engines (netlify/edge-functions/pages), so the
 * FAQ structured data matches what visitors see.
 */
const CalculatorInfo = () => (
  <section
    aria-labelledby="calculator-info"
    style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 80px', fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--ui-text-body)' }}
  >
    <h2 id="calculator-info" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 12 }}>
      {CALCULATOR_INFO.heading}
    </h2>
    <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{CALCULATOR_INFO.intro}</p>
    <ol style={{ fontSize: 15, lineHeight: 1.7, paddingLeft: 20, listStyle: 'decimal', display: 'grid', gap: 6, marginBottom: 24 }}>
      {CALCULATOR_INFO.steps.map((step) => <li key={step}>{step}</li>)}
    </ol>

    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 8 }}>Assumptions used</h3>
    <ul style={{ fontSize: 15, lineHeight: 1.7, paddingLeft: 20, listStyle: 'disc', display: 'grid', gap: 4, marginBottom: 32 }}>
      {CALCULATOR_INFO.assumptions.map((item) => <li key={item}>{item}</li>)}
    </ul>

    <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ui-text)', marginBottom: 12 }}>Frequently Asked Questions</h2>
    <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
      {CALCULATOR_FAQS.map((faq) => (
        <details key={faq.question} style={{ background: 'var(--ui-surface)', border: '1px solid var(--ui-line)', borderRadius: 12, padding: '14px 18px' }}>
          <summary style={{ cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--ui-text)' }}>{faq.question}</summary>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>{faq.answer}</p>
        </details>
      ))}
    </div>

    <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ui-text-faint)' }}>{CALCULATOR_INFO.disclaimer}</p>
  </section>
);

export default CalculatorInfo;
