import FreestyleUsageAddon from 'ember-freestyle/components/freestyle-usage';

export default class FreestyleUsage extends FreestyleUsageAddon {
  get show(): boolean {
    return true;
  }

  // Only show source when @source is explicitly passed - avoids auto-extracted wrapper code
  override get hasCode(): boolean {
    return !!this.args.source;
  }
}
