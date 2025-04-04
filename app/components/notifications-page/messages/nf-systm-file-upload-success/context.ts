export class NfSystmFileUploadSuccessContext {
  package_name: string;
  platform: number;
  platform_display: string;
  file_id: string;
  version: string;
  version_code: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.file_id = input_json.file_id;
    this.package_name = input_json.package_name;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.version = input_json.version;
    this.version_code = input_json.version_code;
  }
}
