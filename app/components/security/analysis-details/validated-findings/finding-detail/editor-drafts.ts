import { tracked } from '@glimmer/tracking';

/**
 * What a reader has typed into the rich text editors of one finding.
 *
 * The record holds plain text, because the read-only KnoxIQ page renders
 * these fields escaped. Keeping the html here means formatting does not
 * vanish mid-edit. Moving to another finding drops the drafts, so one
 * finding's text never shows under another.
 */
export default class FindingEditorDrafts {
  @tracked values: Record<string, string> = {};
  @tracked findingId: string | null = null;

  /**
   * The html to show in an editor.
   *
   * @param findingId The finding being edited.
   * @param field The editor's field name.
   * @param savedValue What the record holds.
   * @returns The draft when there is one, otherwise the saved value.
   */
  valueFor(findingId: string, field: string, savedValue: string) {
    return this.findingId === findingId
      ? (this.values[field] ?? savedValue)
      : savedValue;
  }

  /**
   * Keeps what the reader typed.
   *
   * @param findingId The finding being edited.
   * @param field The editor's field name.
   * @param value The html the editor produced.
   */
  remember(findingId: string, field: string, value: string) {
    this.values =
      this.findingId === findingId
        ? { ...this.values, [field]: value }
        : { [field]: value };

    this.findingId = findingId;
  }
}
