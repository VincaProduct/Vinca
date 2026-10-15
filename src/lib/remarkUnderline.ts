/**
 * Markdown has no underline syntax, so the blog editor stores underlined text
 * as `<u>text</u>`. react-markdown drops raw HTML, so this remark plugin turns
 * those tag pairs into real <u> elements without enabling raw HTML in general.
 */

interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hName?: string };
}

const isTag = (node: MdNode, tag: string) =>
  node.type === 'html' && node.value?.trim().toLowerCase() === tag;

const transform = (node: MdNode) => {
  if (!node.children) return;

  const children: MdNode[] = [];
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isTag(child, '<u>')) {
      const end = node.children.findIndex((c, j) => j > i && isTag(c, '</u>'));
      if (end !== -1) {
        children.push({ type: 'underline', data: { hName: 'u' }, children: node.children.slice(i + 1, end) });
        i = end;
        continue;
      }
    }
    children.push(child);
  }
  node.children = children;
  node.children.forEach(transform);
};

export const remarkUnderline = () => (tree: MdNode) => transform(tree);
