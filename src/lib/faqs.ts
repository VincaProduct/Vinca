import { supabase } from '@/integrations/supabase/client';
import { readSsrData } from '@/lib/ssrData';

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQ pairs with both a question and an answer, trimmed */
export const cleanFaqs = (value: unknown): FaqItem[] =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          question: String(item?.question ?? '').trim(),
          answer: String(item?.answer ?? '').trim(),
        }))
        .filter((item) => item.question && item.answer)
    : [];

let globalFaqsRequest: Promise<FaqItem[]> | null = null;

/**
 * Company FAQs shown on every post. Server-rendered posts embed them (as
 * `global_faqs` on the post data), otherwise they are fetched once per visit.
 */
export const loadGlobalFaqs = (): Promise<FaqItem[]> => {
  if (!globalFaqsRequest) {
    const embedded = readSsrData<{ global_faqs?: unknown }>('blog-post-data')?.global_faqs;
    globalFaqsRequest = embedded
      ? Promise.resolve(cleanFaqs(embedded))
      : Promise.resolve(
          supabase.from('global_faqs').select('question,answer').order('position', { ascending: true }),
        ).then(({ data, error }) => {
          if (error) {
            globalFaqsRequest = null;
            return [];
          }
          return cleanFaqs(data);
        });
  }
  return globalFaqsRequest;
};

/** Forget the cached company FAQs (after editing them in the CMS) */
export const resetGlobalFaqsCache = () => {
  globalFaqsRequest = null;
};
