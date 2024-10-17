import Controller from '@ember/controller';

export default class AuthenticatedDashboardProjectSettingsIndexController extends Controller {
  queryParams = [
    {
      referrer: { type: 'string' as const },
    },
    {
      file_id: { type: 'string' as const },
    },
  ];

  referrer = '';
  file_id = '';
}
