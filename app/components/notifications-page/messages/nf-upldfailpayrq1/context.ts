export class NfUpldfailpayrq1Context {
  package_name: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.package_name = input_json.package_name;
  }
}
