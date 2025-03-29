import Component from '@glimmer/component';
import type { ReportPreviewData } from 'irene/models/report-request';

type TableColumn = { name: string; val_field: string };

interface AiReportingPreviewColumnValueSignature {
  Args: { column: TableColumn; value: ReportPreviewData };
}

export default class AiReportingPreviewColumnValue extends Component<AiReportingPreviewColumnValueSignature> {
  get value() {
    const field = this.args.column.val_field;

    if (field.includes('__')) {
      const [prefix, suffix] = field.split('__');

      return this.args.value[prefix as string][suffix as string];
    }

    return this.args.value[field];
  }

  get computedWidth() {
    const value = String(this.value || '');
    const MIN_WIDTH = 150; // Minimum width in pixels
    const MAX_WIDTH = 550; // Maximum width in pixels
    const CHAR_WIDTH = 8; // Average character width in pixels
    const OPTIMAL_WIDTH = 300; // Optimal width for 2-3 lines of content

    // Count words in the value
    const wordCount = value.trim().split(/\s+/).length;

    // Calculate width based on content length and word count
    let contentWidth =
      Math.max(this.args.column.name.length, value.length) * CHAR_WIDTH;

    // For single words, keep width to content width
    if (wordCount <= 1) {
      contentWidth = Math.max(MIN_WIDTH, contentWidth);
    }
    // For content that would fit in 2-3 lines at optimal width, use optimal width
    else if (value.length * CHAR_WIDTH <= OPTIMAL_WIDTH * 3) {
      contentWidth = OPTIMAL_WIDTH;
    }
    // For longer content, expand up to the maximum width
    else {
      contentWidth = Math.min(contentWidth, MAX_WIDTH);
    }

    // Ensure width is within constraints
    return `${Math.max(MIN_WIDTH, contentWidth)}px`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ai-reporting/preview/column-value': typeof AiReportingPreviewColumnValue;
  }
}
