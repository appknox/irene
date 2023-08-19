export class NfSbomcmpltdContext {
  package_name: string;
  platform: number;
  platform_display: string;
  file_id: number;
  file_name: string;
  version: string;
  version_code: string;
  sb_project_id: number;
  sb_file_id: number;
  components_with_updates_count: number;
  vulnerable_components_count: number;
  components_count: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.file_id = input_json.file_id;
    this.file_name = input_json.file_name;
    this.version = input_json.version;
    this.version_code = input_json.version_code;
    this.sb_project_id = input_json.sb_project_id;
    this.sb_file_id = input_json.sb_file_id;

    this.components_with_updates_count =
      input_json.components_with_updates_count;

    this.vulnerable_components_count = input_json.vulnerable_components_count;
    this.components_count = input_json.components_count;
  }
}
