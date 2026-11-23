/**
 * While a page's code or the sign-in check is still loading, keep showing the
 * server's pre-rendered copy of that page (what the visitor already sees)
 * instead of a spinner. It's only used for the page the visitor first landed
 * on; later in-app navigation shows the usual spinner.
 */
const root = typeof document !== 'undefined' ? document.getElementById('root') : null;
const initialHtml = root?.innerHTML.trim() || '';
const initialPath = typeof window !== 'undefined' ? window.location.pathname : '';

/** True when the visitor first saw the server's copy (skip entrance animations then) */
export const startedFromPrerender = !!initialHtml;

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const PrerenderFallback = () => {
  if (initialHtml && window.location.pathname === initialPath) {
    // Our own server's HTML for this page, already on screen before React started
    return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: initialHtml }} />;
  }
  return <Spinner />;
};

export default PrerenderFallback;
