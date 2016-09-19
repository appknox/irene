export default function() {

  this.get('/projects', function() {
    return {
      "projects": [{
		"jiraProject": null,
		"packageName": "com.appknox.dvia",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-21 05:43:03.278720+00:00",
		"updatedOn": "2016-08-21 05:43:03.289807+00:00",
		"uuid": "f6b2a0f5-868a-485d-84c7-55c18b42239d",
		"id": 496,
		"testPassword": null,
		"type": "project",
		"platform": 1,
		"name": "DVIA                            ",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "in.swiggy.android",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-21 05:43:05.262176+00:00",
		"updatedOn": "2016-08-23 11:05:26.839405+00:00",
		"uuid": "b330b63b-9c98-4ddc-89aa-9d9fa9dbe48c",
		"id": 497,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "Swiggy",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "org.devgeeks.pixfor",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-21 05:43:15.905786+00:00",
		"updatedOn": "2016-08-21 05:43:15.914677+00:00",
		"uuid": "ee46acd8-6348-4971-9539-b7cbe4437ee6",
		"id": 498,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "Pixfor",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "com.azuga.smartfleet",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-26 07:55:24.009569+00:00",
		"updatedOn": "2016-08-26 07:55:24.021916+00:00",
		"uuid": "2b7031d5-95cf-427d-9dc9-1f5710e6a0e7",
		"id": 554,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "Azuga FleetMobile",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "com.finatics.finomena",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-24 14:41:52.594581+00:00",
		"updatedOn": "2016-08-24 14:41:52.602665+00:00",
		"uuid": "f0263ab9-1533-42fc-a415-c50aed5bb0c2",
		"id": 534,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "Finomena",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "com.numberman.aboutnumber",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-24 15:03:49.795091+00:00",
		"updatedOn": "2016-08-24 15:03:49.805413+00:00",
		"uuid": "a76dad01-a13e-4ba9-99f3-3f19a2303fb7",
		"id": 535,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "Strike",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "com.azuga.ruc",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-26 07:55:35.937021+00:00",
		"updatedOn": "2016-08-26 07:55:35.945284+00:00",
		"uuid": "33c7db92-5ad3-4866-b7f0-fa98db77f97d",
		"id": 555,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "Azuga Insight",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "com.oyo.consumer",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-25 07:04:15.600750+00:00",
		"updatedOn": "2016-08-25 07:04:15.609414+00:00",
		"uuid": "debc4f69-97bb-4709-9bc6-be5af9132b6a",
		"id": 540,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "OYO",
		"testUser": null
	}, {
		"jiraProject": null,
		"packageName": "and.dev.azuga",
		"githubRepo": null,
		"fileCount": null,
		"owner": 1,
		"url": null,
		"createdOn": "2016-08-26 07:55:21.819020+00:00",
		"updatedOn": "2016-08-26 07:55:21.827387+00:00",
		"uuid": "a468a8b6-ce96-42dc-a354-2a8bcd4ed3b5",
		"id": 553,
		"testPassword": null,
		"type": "project",
		"platform": 0,
		"name": "DriveSafe",
		"testUser": null
	  }]
   }
  });

  this.namespace = 'api';

  this.post('/login', (schema, request) => {
    return {user: '1', token: 'secret'};
  });

  this.get('/check', (schema, request) => {
    return {user: '1', token: 'secret'};
  });

  this.post('/logout', (schema, request) => {
    return {};
  });


}
