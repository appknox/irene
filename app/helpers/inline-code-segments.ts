import { helper } from '@ember/component/helper';

export interface InlineCodeSegment {
  text: string;
  isCode: boolean;
}

// Splits free text on backtick-delimited spans (standard inline-code
// markdown), e.g. 'sent `GET /run?target=1; id`' -> [{text: 'sent ',
// isCode: false}, {text: 'GET /run?target=1; id', isCode: true}]. The
// output-phase prompt instructs the model to wrap literal request
// lines/commands/output in backticks precisely so evidence bullets can be
// rendered this way instead of as one ambiguous run of prose.
export function splitInlineCodeSegments(text: string): InlineCodeSegment[] {
  if (!text) {
    return [];
  }

  const segments: InlineCodeSegment[] = [];
  const re = /`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isCode: false,
      });
    }
    segments.push({ text: match[1] ?? '', isCode: true });
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isCode: false });
  }

  return segments;
}

export default helper(([text]: [string]) => splitInlineCodeSegments(text));
