import { htmlSafe } from '@ember/template';
import { marked } from 'marked';

export function renderMarkdown(text: string): ReturnType<typeof htmlSafe> {
  if (!text) return htmlSafe('');
  const html = marked.parse(text) as string;
  return htmlSafe(html);
}
