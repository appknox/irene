export interface FailedRoleName {
  id: number;
  name: string;
}

export class NfAutomatedDastPartiallyCompletedContext {
  file_id: string;
  platform: string;
  package_name: string;
  manual_dast_url: string;
  failed_role_names: FailedRoleName[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.file_id = input_json.file_id;
    this.platform = input_json.platform;
    this.package_name = input_json.package_name;
    this.manual_dast_url = input_json.manual_dast_url;
    this.failed_role_names = input_json.failed_role_names ?? [];
  }
}
