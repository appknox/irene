export class NfSbomVulnUpdateContext {
  component_name: string;
  ghsa_ids: string[];
  max_severity: string;
  fixed_version: string;
  affected_apps_count: number;
  name: string;
  advisory_urls: string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.component_name = input_json.component_name ?? '';
    this.ghsa_ids = input_json.ghsa_ids ?? [];
    this.max_severity = input_json.max_severity;
    this.fixed_version = input_json.fixed_version;
    this.affected_apps_count = input_json.affected_apps_count;
    this.name = input_json.name ?? '';
    this.advisory_urls = input_json.advisory_urls ?? [];
  }
}
