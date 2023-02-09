export class NfUpldfailnprjdeny1Context {
  package_name: string;
  platform: number;
  platform_display: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
  }
}
