export class NfAutomatedDastErroredContext {
  file_id: string;
  platform: string;
  package_name: string;
  error_message: string;
  manual_dast_url: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.file_id = input_json.file_id;
    this.platform = input_json.platform;
    this.package_name = input_json.package_name;
    this.error_message = input_json.error_message;
    this.manual_dast_url = input_json.manual_dast_url;
  }
}
