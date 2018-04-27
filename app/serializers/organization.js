import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.results.map((item)=> {
        debugger
        return {
          id: item.id,
          type: 'organization',
          attributes: {
            name: item.name,
            membersCount: item["members-count"],
            projectsCount: item["projects_count"],
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
