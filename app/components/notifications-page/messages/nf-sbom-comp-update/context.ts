export class NfSbomCompUpdateContext {
  component_name: string;
  old_version: string;
  new_version: string;
  source: string;
  affected_apps_count: number;
  name: string;
  registry_url: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.component_name = input_json.component_name;
    this.old_version = input_json.old_version;
    this.new_version = input_json.new_version;
    this.source = input_json.source;
    this.affected_apps_count = input_json.affected_apps_count;
    this.name = input_json.name ?? '';
    this.registry_url = input_json.registry_url ?? '';
  }

  get displayName(): string {
    if (this.name) {
      return this.name;
    }

    const parts = this.component_name.split('::');

    return parts[1] || this.component_name;
  }
}
