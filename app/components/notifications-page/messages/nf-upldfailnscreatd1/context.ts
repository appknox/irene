export class NfUpldfailnscreatd1Context {
  namespace_value: string;
  platform: number;
  platform_display: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.namespace_value = input_json.namespace_value;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
  }
}
