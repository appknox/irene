export class NfStrUrlUpldfailnsunaprv1Context {
  namespace_value: string;
  platform: number;
  platform_display: string;
  store_url: string;
  error_message: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.namespace_value = input_json.namespace_value;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.store_url = input_json.store_url;
    this.error_message = input_json.error_message;
  }
}
