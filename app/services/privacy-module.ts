import Service from '@ember/service';
import { tracked } from 'tracked-built-ins';

export default class PrivacyModuleService extends Service {
  @tracked expandFileDetailsSummaryFileId: string | null = null;
}
