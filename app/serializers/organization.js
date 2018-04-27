import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.results.map((item)=> {
        return {
          id: item.id,
          type: 'organization',
          attributes: {
            name: item.name,
            invitationCount: item["invitation_count"],
            teamCount: item["team_count"],
            userCount: item["user_count"],
            owner: {
              username: item.username,
              email: item.email,
              role: item.role
            }
          }
        };
      })
    };
  }
});
