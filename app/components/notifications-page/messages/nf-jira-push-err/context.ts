export class NfJiraPushErrContext {
  file_id: number;
  package_name: string;
  error_message: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.file_id = input_json.file_id;
    this.package_name = input_json.package_name;
    this.error_message = input_json.error_message;
  }
}
