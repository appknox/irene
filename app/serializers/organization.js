import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    if(payload.results) {
      return {
        data: payload.results.map((item)=> {
          return {
            id: item.id,
            type: 'organization',
          };
        })
      };
    }
    else {
      return {
        data: {
          id: payload.id,
          type: 'organization',
          attributes: {
            name: payload.name,
            invitationCount: payload["invitation_count"],
            teamCount: payload["team_count"],
            userCount: payload["user_count"],
            owner: {
              username: payload.username,
              email: payload.email,
              role: payload.role
            }
          }
        }
      };
    }
  }
});
