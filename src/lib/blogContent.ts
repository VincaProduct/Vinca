import { marked } from 'marked';
import TurndownService from 'turndown';

/**
 * Blog posts are stored as Markdown (rendered by react-markdown on the site and
 * by `marked` in the Netlify SEO edge function). The rich text editor works in
 * HTML, so these helpers convert between the two.
 */

export const markdownToHtml = (markdown: string): string =>
  marked.parse(markdown || '', { gfm: true, breaks: false, async: false }) as string;

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Markdown has no underline syntax, so keep it as an inline <u> tag
turndown.addRule('underline', {
  filter: ['u'],
  replacement: (content) => (content ? `<u>${content}</u>` : ''),
});

turndown.addRule('strikethrough', {
  filter: ['s', 'del', 'strike'] as TurndownService.Filter,
  replacement: (content) => (content ? `~~${content}~~` : ''),
});

// Tight lists ("- item" / "1. item") instead of turndown's padded, blank-line separated ones
turndown.addRule('listItem', {
  filter: 'li',
  replacement: (content, node, options) => {
    const parent = node.parentNode as HTMLElement;
    let prefix = `${options.bulletListMarker} `;
    if (parent.nodeName === 'OL') {
      const start = Number(parent.getAttribute('start') || 1);
      prefix = `${start + Array.prototype.indexOf.call(parent.children, node)}. `;
    }
    const body = content
      .replace(/^\n+/, '')
      .replace(/\n+$/, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/\n/g, `\n${' '.repeat(prefix.length)}`);
    return prefix + body + (node.nextSibling ? '\n' : '');
  },
});

const cellToMarkdown = (cell: Element) =>
  turndown
    .turndown(cell.innerHTML)
    .replace(/\n+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();

// GFM table. The first row always becomes the header row, since tables pasted
// from Word or Google Docs usually have no <th> cells.
turndown.addRule('table', {
  filter: 'table',
  replacement: (_content, node) => {
    const rows = Array.from((node as HTMLTableElement).rows);
    if (rows.length === 0) return '';

    const grid = rows.map((row) => Array.from(row.cells).map(cellToMarkdown));
    const columns = Math.max(...grid.map((cells) => cells.length));
    const line = (cells: string[]) =>
      `| ${Array.from({ length: columns }, (_, i) => cells[i] || ' ').join(' | ')} |`;

    const [header, ...body] = grid;
    return [
      '',
      line(header),
      line(Array(columns).fill('---')),
      ...body.map(line),
      '',
    ].join('\n') + '\n';
  },
});

export const htmlToMarkdown = (html: string): string =>
  turndown
    .turndown(html || '')
    // Keep inline CTA markers like [[CTA:name]] working after escaping
    .replace(/\\\[\\\[CTA:(.+?)\\\]\\\]/g, (_m, name: string) => `[[CTA:${name.replace(/\\(.)/g, '$1')}]]`)
    .trim();

/** Word marks list paragraphs with `mso-list:l0 level1 lfo1` instead of using <ul>/<ol>. */
const isWordListParagraph = (el: Element | null): el is HTMLElement =>
  !!el && el.tagName === 'P' && /mso-list:\s*l\d+/i.test(el.getAttribute('style') || '');

const convertWordLists = (doc: Document) => {
  const handled = new Set<Element>();

  doc.querySelectorAll('p').forEach((first) => {
    if (handled.has(first) || !isWordListParagraph(first)) return;

    const run: HTMLElement[] = [];
    let current: Element | null = first;
    while (isWordListParagraph(current)) {
      run.push(current);
      handled.add(current);
      current = current.nextElementSibling;
    }

    const fragment = doc.createDocumentFragment();
    const stack: { level: number; list: HTMLElement }[] = [];

    run.forEach((p) => {
      const style = p.getAttribute('style') || '';
      const level = Number(style.match(/level(\d+)/i)?.[1] || 1);

      // The bullet/number Word renders itself lives in a span marked mso-list:Ignore
      const markers = Array.from(p.querySelectorAll('span')).filter((span) =>
        /mso-list:\s*ignore/i.test(span.getAttribute('style') || ''),
      );
      const markerText = markers.map((m) => m.textContent || '').join('').trim();
      markers.forEach((m) => m.remove());
      const ordered = /^\(?[0-9a-zA-Z]{1,4}[.)]/.test(markerText);
      const tag = ordered ? 'OL' : 'UL';

      while (stack.length && stack[stack.length - 1].level > level) stack.pop();

      const top = stack[stack.length - 1];
      if (!top || top.level < level || (top.level === level && top.list.tagName !== tag && stack.length === 1)) {
        if (top && top.level === level) stack.pop();
        const list = doc.createElement(tag);
        const parent = stack[stack.length - 1];
        if (parent) {
          let parentItem = parent.list.lastElementChild;
          if (!parentItem) {
            parentItem = doc.createElement('li');
            parent.list.appendChild(parentItem);
          }
          parentItem.appendChild(list);
        } else {
          fragment.appendChild(list);
        }
        stack.push({ level, list });
      }

      const item = doc.createElement('li');
      const paragraph = doc.createElement('p');
      while (p.firstChild) paragraph.appendChild(p.firstChild);
      paragraph.innerHTML = paragraph.innerHTML.replace(/^(\s|&nbsp;)+/, '');
      item.appendChild(paragraph);
      stack[stack.length - 1].list.appendChild(item);
    });

    run[0].parentNode?.insertBefore(fragment, run[0]);
    run.forEach((p) => p.remove());
  });
};

/**
 * Cleans HTML pasted from Word (and similar apps) so the editor keeps headings,
 * bold/italic/underline, lists, tables and links, and drops Office-only markup.
 */
export const cleanPastedHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Comments (Word's <!--[if !supportLists]--> etc.), styles and metadata
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.parentNode?.removeChild(c));
  doc.querySelectorAll('style, script, meta, link, title, xml').forEach((el) => el.remove());

  convertWordLists(doc);

  // Office namespaced tags like <o:p> and <v:shape>: keep their text, drop the tag
  Array.from(doc.body.querySelectorAll('*'))
    .filter((el) => el.tagName.includes(':'))
    .forEach((el) => el.replaceWith(...Array.from(el.childNodes)));

  // Images that point at the local disk (Word) or are embedded inline can't be
  // shown on the website; they need to be uploaded with the image button
  doc.querySelectorAll('img').forEach((img) => {
    if (!/^https?:/i.test(img.getAttribute('src') || '')) img.remove();
  });

  // The post title is the page's H1, so pasted top-level headings (and Word's
  // "Title" style) become H2 section headings, which also feed the TOC
  doc.querySelectorAll('h1, p.MsoTitle').forEach((el) => {
    const heading = doc.createElement('h2');
    heading.innerHTML = el.innerHTML;
    el.replaceWith(heading);
  });

  return doc.body.innerHTML;
};
