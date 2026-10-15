import { useEffect, useState } from 'react';
import { cleanFaqs, loadGlobalFaqs, type FaqItem } from '@/lib/faqs';

interface BlogFaqSectionProps {
  postFaqs: unknown;
  showGlobalFaqs: boolean;
}

/**
 * "Frequently Asked Questions" at the end of a post: the post's own questions
 * first, then the company FAQs. Uses <details> so every answer is in the page
 * for search engines even while collapsed.
 */
export const BlogFaqSection = ({ postFaqs, showGlobalFaqs }: BlogFaqSectionProps) => {
  const [globalFaqs, setGlobalFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (!showGlobalFaqs) {
      setGlobalFaqs([]);
      return;
    }
    let cancelled = false;
    loadGlobalFaqs().then((faqs) => {
      if (!cancelled) setGlobalFaqs(faqs);
    });
    return () => {
      cancelled = true;
    };
  }, [showGlobalFaqs]);

  const faqs = [...cleanFaqs(postFaqs), ...globalFaqs];
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="faqs" className="blog-faqs mt-12 sm:mt-16">
      <h2 id="faqs">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <details key={index}>
          <summary>{faq.question}</summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </section>
  );
};
