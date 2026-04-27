import { helper } from '@ember/component/helper';
import { renderMarkdown } from 'irene/utils/render-markdown';

function renderMarkdownHelper([text]: [string]) {
  return renderMarkdown(text ?? '');
}

const renderMarkdownHelperFn = helper(renderMarkdownHelper);

export default renderMarkdownHelperFn;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'render-markdown': typeof renderMarkdownHelperFn;
  }
}
