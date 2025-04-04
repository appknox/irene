export class NfSkNewversnContext {
  package_name: string;
  app_name: string;
  sk_app_version_id: number;
  sk_app_id: string;
  project_id: number;
  platform: number;
  platform_display: string;
  version_unscanned: string;
  version_scanned: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
    this.app_name = input_json.app_name;
    this.sk_app_version_id = input_json.sk_app_version_id;
    this.sk_app_id = input_json.sk_app_id;
    this.project_id = input_json.project_id;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.version_unscanned = input_json.version_unscanned;
    this.version_scanned = input_json.version_scanned;
  }
}
