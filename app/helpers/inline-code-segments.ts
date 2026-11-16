import { helper } from '@ember/component/helper';

export interface InlineCodeSegment {
  text: string;
  isCode: boolean;
}

// Splits free text on backtick-delimited inline-code spans, e.g.
// 'sent `GET /x`' -> [{text: 'sent ', isCode: false}, {text: 'GET /x', isCode: true}].
export function splitInlineCodeSegments(text: string): InlineCodeSegment[] {
  if (!text) {
    return [];
  }

  // Capturing-group split alternates plain/code chunks (even/odd indices).
  return text
    .split(/`([^`]+)`/)
    .map((chunk, index) => ({ text: chunk, isCode: index % 2 === 1 }))
    .filter((segment) => segment.text !== '');
}

export default helper(([text]: [string]) => splitInlineCodeSegments(text));
