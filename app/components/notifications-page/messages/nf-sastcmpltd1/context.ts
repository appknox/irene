export class NfSastcmpltd1Context {
  package_name: string;
  platform: number;
  platform_display: string;
  file_id: number;
  file_name: string;
  submission_source_display: string;
  version: string;
  version_code: string;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  passed_count: number;
  untested_count: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.file_id = input_json.file_id;
    this.file_name = input_json.file_name;
    this.submission_source_display = input_json.submission_source_display;
    this.version = input_json.version;
    this.version_code = input_json.version_code;
    this.critical_count = input_json.critical_count || 0;
    this.high_count = input_json.high_count || 0;
    this.medium_count = input_json.medium_count || 0;
    this.low_count = input_json.low_count || 0;
    this.passed_count = input_json.passed_count || 0;
    this.untested_count = input_json.untested_count || 0;
  }
}
