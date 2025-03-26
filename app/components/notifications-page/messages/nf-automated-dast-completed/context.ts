export class NfAutomatedDastCompletedContext {
  file_id: string;
  platform: string;
  package_name: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.file_id = input_json.file_id;
    this.platform = input_json.platform;
    this.package_name = input_json.package_name;
  }
}
