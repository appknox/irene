export class NfStrUrlUpldfailpayrq1Context {
  package_name: string;
  store_url: string;
  error_message: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
    this.store_url = input_json.store_url;
    this.error_message = input_json.error_message;
  }
}
