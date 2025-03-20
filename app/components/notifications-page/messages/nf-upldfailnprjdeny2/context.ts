export class NfUpldfailnprjdeny2Context {
  project_id: string;
  package_name: string;
  platform: number;
  platform_display: string;
  requester_username: string;
  requester_role: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.project_id = input_json.project_id;
    this.package_name = input_json.package_name;
    this.platform = input_json.platform;
    this.platform_display = input_json.platform_display;
    this.requester_username = input_json.requester_username;
    this.requester_role = input_json.requester_role;
  }
}
