export class NfSkSubexpContext {
  organization_name: string;
  weeks_remaining: number;
  subscription_end_date: string;
  is_trial: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(input_json: any) {
    this.organization_name = input_json.organization_name;
    this.weeks_remaining = input_json.weeks_remaining;
    this.subscription_end_date = input_json.subscription_end_date;
    this.is_trial = input_json.is_trial;
  }
}
