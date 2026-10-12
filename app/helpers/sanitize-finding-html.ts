import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

// The marks AkRichTextEditor can produce. Anything else is unwrapped.
const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'B',
  'EM',
  'I',
  'U',
  'S',
  'CODE',
  'PRE',
  'UL',
  'OL',
  'LI',
  'A',
]);

// Unwrapping these would leak their source as visible text.
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE']);

const SAFE_HREF = /^(https?:|mailto:)/i;

// Strips all attributes from the element.
function _stripAttributes(element: Element) {
  Array.from(element.attributes).forEach(({ name }) =>
    element.removeAttribute(name)
  );
}

// Rebuilt rather than allowed through: a crafted target with no rel would
// hand the opened page a reference back to this one.
function _rebuildLink(link: Element) {
  const href = link.getAttribute('href')?.trim() ?? '';
  const isSafe = SAFE_HREF.test(href);

  _stripAttributes(link);

  if (!isSafe) {
    return;
  }

  link.setAttribute('href', href);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer nofollow');
}

// Checks if the node is allowed and sanitizes it if it is.
function _sanitizeHtmlNode(node: Element) {
  Array.from(node.children).forEach((child) => {
    if (DROPPED_TAGS.has(child.tagName)) {
      child.remove();

      return;
    }

    if (!ALLOWED_TAGS.has(child.tagName)) {
      child.replaceWith(...Array.from(child.childNodes));

      return;
    }

    if (child.tagName === 'A') {
      _rebuildLink(child);
    } else {
      _stripAttributes(child);
    }

    _sanitizeHtmlNode(child);
  });
}

/**
 * Narrows finding text to the marks the editor can produce, so it can render
 * unescaped. Plain text passes through unchanged.
 *
 * @param positional The stored finding text.
 * @returns Safe markup for the template.
 */
export function sanitizeFindingHtmlHelper([html]: [string | undefined | null]) {
  if (!html) {
    return htmlSafe('');
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  _sanitizeHtmlNode(parsed.body);

  return htmlSafe(parsed.body.innerHTML);
}

const SanitizeFindingHtmlHelper = helper(sanitizeFindingHtmlHelper);

export default SanitizeFindingHtmlHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'sanitize-finding-html': typeof SanitizeFindingHtmlHelper;
  }
}
