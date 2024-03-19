import Controller from '@ember/controller';

export default class AuthenticatedOrganizationUsersController extends Controller {
  queryParams = [
    {
      user_limit: { type: 'number' as const },
    },
    {
      user_offset: { type: 'number' as const },
    },
    {
      user_query: { type: 'string' as const },
    },
    {
      show_inactive_user: { type: 'boolean' as const },
    },
    {
      invite_limit: { type: 'number' as const },
    },
    {
      invite_offset: { type: 'number' as const },
    },
  ];

  user_limit = 10;
  user_offset = 0;
  user_query = '';
  show_inactive_user = false;
  invite_limit = 10;
  invite_offset = 0;
}
