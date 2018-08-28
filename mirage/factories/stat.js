import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  totalCritical: 5,
  totalHigh: 4,
  totalMedium: 3,
  totalLow: 2,

  totalAppsScanned: 65,
  totalAndroidApps: 45,
  totalIOSApps: 20,

  totalStaticScans: 40,
  totalDynamicScans: 35,
  totalAPIScans: 30,
  totalManualScans: 25,

  overallCVSSSCore: "6.7",

  scanData() {
    return [
      { date: "31 JULY", count: 1},
      { date: "30 JULY", count: 5},
      { date: "29 JULY", count: 6},
      { date: "28 JULY", count: 3},
      { date: "27 JULY", count: 8},
      { date: "26 JULY", count: 10},
      { date: "24 JULY", count: 4},
      { date: "23 JULY", count: 6},
      { date: "22 JULY", count: 7},
      { date: "21 JULY", count: 9},
    ];
  },

  recentIssues() {
    return [
      { date: "APR", count: 1},
      { date: "MAY", count: 5},
      { date: "JUN", count: 6},
      { date: "JUL", count: 3},
      { date: "AUG", count: 8},
    ];
  },

  recentlyFixedIssues() {
    return [
      {
        risk: "Low",
        fileId: 1200,
        issue: "Insecure Hashing Algorithm"
      },
      {
        risk: "High",
        fileId: 7519,
        issue: "Do not allow WebView to access sensitive local resource through file scheme"
      },
      {
        risk: "Critical",
        fileId: 1500,
        issue: "MediaProjection: Android Service Allows Recording of Audio, Screen Activity"
      },
      {
        risk: "Medium",
        fileId: 9780,
        issue: "Cross Site Tracing Vulnerabilities"
      },
      {
        risk: "Low",
        fileId: 3334,
        issue: "Command Injection Vulnerabilities in HTTP Requests"
      }
    ]
  },

  activities() {
    return [
      {
        date: "Today at 4:24 PM",
        file: {id: 6507, name: "com.highaltitudehacks.DVIAswiftv2"},
        user: {name: "yash"},
        type: "Static Scan",
        platform: "Android"
      },
      {
        date: "Today at 4:24 PM",
        file: {id: 6507, name: "com.highaltitudehacks.DVIAswiftv2"},
        user: {name: "dhilipsiva"},
        type: "Dynamic Scan",
        platform: "iOS"
      },
      {
        date: "Today at 4:24 PM",
        file: {id: 6507, name: "com.highaltitudehacks.DVIAswiftv2"},
        user: {name: "yash"},
        type: "Manual Scan",
        platform: "iOS"
      },
      {
        date: "Today at 4:24 PM",
        file: {id: 6507, name: "com.highaltitudehacks.DVIAswiftv2"},
        user: {name: "dhilipsiva"},
        type: "API Scan",
        platform: "Android"
      }
    ]
  }

});
