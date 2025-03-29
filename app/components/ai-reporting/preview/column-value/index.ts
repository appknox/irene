import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { ReportPreviewData } from 'irene/models/report-request';

type TableColumn = { name: string; val_field: string; field_type: string };

interface AiReportingPreviewColumnValueSignature {
  Args: { column: TableColumn; value: ReportPreviewData };
}

export default class AiReportingPreviewColumnValue extends Component<AiReportingPreviewColumnValueSignature> {
  // Character threshold for showing the toggle
  readonly CONTENT_THRESHOLD = 1000;

  @tracked isExpanded = false;

  constructor(
    owner: unknown,
    args: AiReportingPreviewColumnValueSignature['Args']
  ) {
    super(owner, args);

    dayjs.extend(customParseFormat);
  }

  get value() {
    const field = this.args.column.val_field;
    const data = this.args.value;

    const value = this.getNestedValue(data, field);

    if (this.args.column.field_type === 'datetime') {
      if (value) {
        return dayjs(value as string).format('MMM DD, YYYY');
      }

      return '';
    }

    return value;
  }

  get displayValue() {
    const value = String(this.value || '');

    if (value.length <= this.CONTENT_THRESHOLD || this.isExpanded) {
      return value;
    }

    return value.substring(0, this.CONTENT_THRESHOLD) + '...';
  }

  get shouldShowToggle() {
    const value = String(this.value || '');
    return value.length > this.CONTENT_THRESHOLD;
  }

  toggleDetails = () => {
    this.isExpanded = !this.isExpanded;
  };

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

  /**
   * Safely retrieves a nested property from an object using a path string.
   *
   * The path string uses '__' as a delimiter for nested levels.
   * This function handles ambiguity where actual keys within the object might also
   * contain '__'. It prioritizes accessing individual parts of the path directly,
   * but if that fails, it attempts to use the remaining segment of the path
   * (including any '__') as a single key.
   *
   * @param obj The object to retrieve the value from.
   * @param path The '__' delimited string representing the property path.
   * @returns The value at the specified path, or undefined if the path doesn't exist
   *          or if traversal encounters a non-object value.
   */
  getNestedValue = (obj: ReportPreviewData, path: string) => {
    const parts = path.split('__');
    let current = obj;
    let partsConsumed = 0;

    while (partsConsumed < parts.length) {
      if (
        current === null ||
        current === undefined ||
        typeof current !== 'object'
      ) {
        return undefined; // Cannot traverse further
      }

      const currentPart = parts[partsConsumed] as string;

      // 1. Try accessing the current part directly
      if (currentPart in current) {
        current = current[currentPart] as ReportPreviewData;
        partsConsumed++;

        continue; // Move to the next part
      }

      // 2. If direct access failed, try reconstructing the rest of the path
      //    Check if the *entire remaining path* exists as a single key.
      const remainingPath = parts.slice(partsConsumed).join('__');

      if (remainingPath in current) {
        return current[remainingPath]; // Found the value using the reconstructed key
      }

      // 3. If both direct access and reconstructed path failed
      return undefined;
    }

    // If all parts were consumed individually
    return current;
  };
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ai-reporting/preview/column-value': typeof AiReportingPreviewColumnValue;
  }
}
