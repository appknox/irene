export class NfSbomCompUpdateContext {
  component_name: string;
  old_version: string;
  new_version: string;
  source: string;
  affected_apps_count: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.component_name = input_json.component_name;
    this.old_version = input_json.old_version;
    this.new_version = input_json.new_version;
    this.source = input_json.source;
    this.affected_apps_count = input_json.affected_apps_count;
  }
}
