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

  this.get('/files', function() {
    return {
      "files": [{
		"createdOn": "2016-08-23 11:05:26.879256+00:00",
		"manual": 0,
		"report": "931_in.swiggy.android_19a0e7f6-7d91-440b-9c04-bccd7e752002.pdf",
		"sha1hash": "c420e3553c7936ca6d94d6439d7667bc4adfb8c0",
		"uuid": "19a0e7f6-7d91-440b-9c04-bccd7e752002",
		"updatedOn": "2016-08-23 11:05:26.879284+00:00",
		"isDynamicDone": false,
		"project": 497,
		"type": "file",
		"isStaticDone": false,
		"dynamicStatus": 0,
		"deviceToken": "None",
		"version": "1.5",
		"iconUrl": "https://appknox-production.s3.amazonaws.com/19a0e7f6-7d91-440b-9c04-bccd7e752002.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJVFM4UJLOXTCBGHA%2F20160920%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20160920T062843Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=0e8fa7073984e020de0e8b325a0f1c77c16f31336328e8d0c68835016bb24da6",
		"id": 931,
		"md5hash": "820adddd9b89aa5d0fa74b6279eb088e",
		"name": "in.swiggy.android"
	}, {
		"createdOn": "2016-08-21 05:43:13.902566+00:00",
		"manual": 0,
		"report": "889_in.swiggy.android_e06d0f4c-70ec-44b2-9961-920928771ce3.pdf",
		"sha1hash": "c420e3553c7936ca6d94d6439d7667bc4adfb8c0",
		"uuid": "e06d0f4c-70ec-44b2-9961-920928771ce3",
		"updatedOn": "2016-08-21 05:43:13.902605+00:00",
		"isDynamicDone": false,
		"project": 497,
		"type": "file",
		"isStaticDone": false,
		"dynamicStatus": 0,
		"deviceToken": "None",
		"version": "1.5",
		"iconUrl": "https://appknox-production.s3.amazonaws.com/e06d0f4c-70ec-44b2-9961-920928771ce3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJVFM4UJLOXTCBGHA%2F20160920%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20160920T062843Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=3555634b5bd1c0626d4b70a0d30780f04dfd2fb339fc9ce008fa7344590fb104",
		"id": 889,
		"md5hash": "820adddd9b89aa5d0fa74b6279eb088e",
		"name": "in.swiggy.android"
	}, {
		"createdOn": "2016-08-21 05:43:09.101626+00:00",
		"manual": 0,
		"report": "888_in.swiggy.android_a767c214-42ba-46f6-a5e4-64947562cbb8.pdf",
		"sha1hash": "c420e3553c7936ca6d94d6439d7667bc4adfb8c0",
		"uuid": "a767c214-42ba-46f6-a5e4-64947562cbb8",
		"updatedOn": "2016-08-21 05:43:09.101662+00:00",
		"isDynamicDone": false,
		"project": 497,
		"type": "file",
		"isStaticDone": false,
		"dynamicStatus": 0,
		"deviceToken": "None",
		"version": "1.5",
		"iconUrl": "https://appknox-production.s3.amazonaws.com/a767c214-42ba-46f6-a5e4-64947562cbb8.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJVFM4UJLOXTCBGHA%2F20160920%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20160920T062844Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=67a878f1995c053f3a2b324ca2a8fb6deb8219261eb54bcbae7d657f4f2b754c",
		"id": 888,
		"md5hash": "820adddd9b89aa5d0fa74b6279eb088e",
		"name": "in.swiggy.android"
	}, {
		"createdOn": "2016-08-21 05:43:05.413428+00:00",
		"manual": 0,
		"report": "887_in.swiggy.android_916aa84d-c0a7-4d1c-85d3-0dec5cf2aa36.pdf",
		"sha1hash": "c420e3553c7936ca6d94d6439d7667bc4adfb8c0",
		"uuid": "916aa84d-c0a7-4d1c-85d3-0dec5cf2aa36",
		"updatedOn": "2016-08-21 05:43:05.413469+00:00",
		"isDynamicDone": false,
		"project": 497,
		"type": "file",
		"isStaticDone": false,
		"dynamicStatus": 0,
		"deviceToken": "None",
		"version": "1.5",
		"iconUrl": "https://appknox-production.s3.amazonaws.com/916aa84d-c0a7-4d1c-85d3-0dec5cf2aa36.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJVFM4UJLOXTCBGHA%2F20160920%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20160920T062844Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=755bf9ba56a991899a086d7fcc33541f4dab694187b012637c58210d1c1909c8",
		"id": 887,
		"md5hash": "820adddd9b89aa5d0fa74b6279eb088e",
		"name": "in.swiggy.android"
	}]
  }
  });

  this.get('/pricings', function(){
    return {
      "pricings":[
        {
          "id" : 1,
          "name": "Lite",
          "heading": "Single Application Project",
          "sast": "SAST (Static)",
          "dast": "DAST (Dynamic)",
          "uba": "UBA (Manual)",
          "remedition": "Remedition :	1 Session",
          "sla": "SLA	: 3-5 Working Days",
          "scans": "No.of Scans :	Unlimited"
        },
        {
          "id" : 2,
          "name": "Essential",
          "heading": "Two Application Project",
          "sast": "SAST (Static)",
          "dast": "DAST (Dynamic)",
          "uba": "UBA (Manual)",
          "remedition": "Remedition :	3 Session",
          "sla": "SLA	: 3-5 Working Days",
          "scans": "No.of Scans :	Unlimited"
        },
        {
          "id" : 3,
          "name": "Premium",
          "heading": "Three Application Project",
          "sast": "SAST (Static)",
          "dast": "DAST (Dynamic)",
          "uba": "UBA (Manual)",
          "remedition": "Remedition : 5 Session",
          "sla": "SLA	: 3-5 Working Days",
          "scans": "No.of Scans :	Unlimited"
        }
      ]
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
