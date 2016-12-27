import config from 'irene/config/environment';


export default function() {

  this.namespace = config.host + "/" +  config.namespace;

  this.get('/users/:id', 'user');
  this.get('/collaborations/:id', 'collaboration');
  this.get('/projects/:id', 'project');
  this.get('/pricings', 'pricing');
  this.get('/submissions/:id', 'submission');
  this.get('/files/:id', 'file');
  this.get('/vulnerabilities/:id', 'vulnerability');
  this.get('/invitations/:id', 'invitation');

  this.post('/signup', () => {
    return {user_id: '1', token: 'secret'};
  });
  this.post('/login', () => {
    return {user_id: '1', token: 'secret'};
  });

  this.post('/check', () => {
    return {user_id: '1', token: 'secret'};
  });

  this.post('/logout', () => {
    return {};
  });
  this.post('/lang', () => {
    return {};
  });

  this.post('/namespace_add', () => {
    return {};
  });
  this.get('/github_repos', () => {
    return {};
  });
  this.get('/jira_projects', () => {
    return {};
  });
  this.get('/devices', () => {
    return {
    "devices": [
        {
            "is_tablet": true,
            "is_available": true,
            "platform_version": "7.1",
            "serial_number": "7060e2903edbbfe20881658018e4d8b588f5b9e4",
            "app_name": null,
            "is_connected": true,
            "platform": 1,
            "package_name": null
        },
        {
            "is_tablet": false,
            "is_available": true,
            "platform_version": "4.4.2",
            "serial_number": "HQ548YL01252",
            "app_name": null,
            "is_connected": true,
            "platform": 0,
            "package_name": null
        },
        {
            "is_tablet": false,
            "is_available": false,
            "platform_version": "4.4.4",
            "serial_number": "ZX1B33XJSS",
            "app_name": null,
            "is_connected": false,
            "platform": 0,
            "package_name": null
        },
        {
            "is_tablet": false,
            "is_available": true,
            "platform_version": "9.0.2",
            "serial_number": "5236726aaf9bc32249ccd231291b34398284e974",
            "app_name": null,
            "is_connected": true,
            "platform": 1,
            "package_name": null
        },
        {
            "is_tablet": false,
            "is_available": false,
            "platform_version": "4.4.2",
            "serial_number": "HQ53ZYL27425",
            "app_name": null,
            "is_connected": false,
            "platform": 0,
            "package_name": null
        }
    ]
};
  });

}
