import { chromium } from '@playwright/test';
import LoginActions from './Actions/auth/loginActions';
import TokenManager from './Actions/api/token.manager';
import RequestWrapper from './Actions/api/request.wrapper';
import { API_ROUTES, resolveRoute } from './support/api.routes';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env.qa') });

const STATE_DIR = path.resolve(__dirname, '../.state');
const STATE_FILE = path.join(
  STATE_DIR,
  `${process.env.ENVIRONMENT || 'qa'}-state.json`
);
const POLL_INTERVAL = 15000; //poll every 15 seconds means we are giving the backend enough time to process the file and generate reports without overwhelming it with too many requests.
const POLL_TIMEOUT = 600000; //10 minutes timeout is a reasonable upper limit for file processing and report generation. If it takes longer than this, it's likely that something has gone wrong, and we don't want our setup to hang indefinitely.

async function globalSetup() {
  /**
   * 1. UI Login ---> save auth
    We do this because some API routes require UI-only tokens (e.g. upload app), so we need to go through the login flow to get those tokens and save them for API use later. 
    loginActions.login() will navigate to the login page, fill in credentials, and submit the form. After successful login, we save the authenticated state (including cookies and local storage) to .auth/user.json for later use in API requests.
    and then we close the browser since we don't need it anymore for the rest of the setup. All subsequent API requests will use the saved auth state to authenticate.  
   */
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: process.env.BASE_URL });
  const page = await context.newPage();
  const login = new LoginActions(page);
  await login.login(process.env.TEST_USERNAME!, process.env.TEST_PASSWORD!);
  await context.storageState({ path: '.auth/user.json' });
  await browser.close();

  /**
   * 2. API setup
   * Next, we initialize our API request wrapper, which will handle making authenticated API requests using the tokens obtained from the UI login.
   * This wrapper will read the saved auth state to include the necessary authentication headers in each request.
   * With the API wrapper ready, we can start making API calls to set up our test data.
   */
  const wrapper = new RequestWrapper();
  await wrapper.init();
  /**
   * 3. Get orgId
   * Many API routes require an orgId, so we make an authenticated request to the /api/organizations endpoint to retrieve
   * the list of organizations and extract the orgId we need for subsequent API calls.
   * orgId is a fundamental piece of data that links all our test entities together (projects, files, reports), so we need to fetch it first before we can do anything else.
   */
  const orgResponse = await wrapper.get({
    endpoint: API_ROUTES.organizations.route,
  });
  const orgBody = await orgResponse.json();
  const orgId = orgBody.results[0].id as number;
  console.log(`[Setup] orgId: ${orgId}`);

  /**
  * 4. Get projectId and fileId
  * Before we can generate reports, we need to have a project with an uploaded file. We will upload the MFVA.apk file, which is a known test app in our system. When we upload this app,
    it will be associated with a project (if it doesn't already exist) and a file record will be created for that upload.
  * We need the projectId to upload our app and the fileId to generate reports, so we have to find these IDs before we can proceed with the rest of the setup.
  */
  const projectListResponse = await wrapper.get({
    endpoint: resolveRoute(API_ROUTES.projectList.route, orgId),
  });
  const projectListBody = await projectListResponse.json();
  const mfvaProject = projectListBody.results.find(
    (p: Record<string, unknown>) => p.package_name === 'com.appknox.mfva'
  );
  if (!mfvaProject) throw new Error('[Setup] MFVA project not found');
  const projectId = mfvaProject.id as number;
  console.log(`[Setup] projectId: ${projectId}`);

  /**
  * 5. Upload MFVA.apk fresh
  To ensure we have a consistent test file to work with, we upload the MFVA.apk file at the start of our setup. 
  fresh upload ensures that we have a known fileId and reportId that we can use in our tests, 
  rather than relying on potentially stale data from previous test runs.
  * 1.The upload process involves first requesting a signed URL from the backend, 
  2.then uploading the file directly to S3 using that URL, 
  3. finally confirming the upload with the backend so it can start processing the file.
  */
  console.log('[Setup] Uploading MFVA.apk...');

  const initResponse = await wrapper.get({
    endpoint: resolveRoute(API_ROUTES.uploadApp.route, orgId),
  });
  const initBody = await initResponse.json();
  const {
    url: s3Url,
    file_key: fileKey,
    file_key_signed: fileKeySigned,
  } = initBody;

  const filePath = path.resolve(__dirname, 'fixtures/MFVA.apk');
  const fileBuffer = fs.readFileSync(filePath);
  const s3Response = await fetch(s3Url, {
    method: 'PUT',
    body: fileBuffer,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  if (!s3Response.ok)
    throw new Error(`[Setup] S3 upload failed: ${s3Response.status}`);

  const confirmResponse = await wrapper.post({
    endpoint: resolveRoute(API_ROUTES.uploadApp.route, orgId),
    body: { file_key: fileKey, file_key_signed: fileKeySigned, url: s3Url },
  });
  const confirmBody = await confirmResponse.json();
  const submissionId = confirmBody.submission_id as number;
  console.log(`[Setup] Upload confirmed, submissionId: ${submissionId}`);
  /**
   * 6.get fileId by polling submission details
   * After confirming the upload, the backend will start processing the file, which includes creating a file record and associating it with our submission.
   * By hiiting the submission details endpoint, we can check if the file has been created and get its fileId. We need to poll this endpoint until we see that the file has been created,
     which indicates that the upload and initial processing steps are complete and we can move on to generating reports.
   */
  console.log('[Setup] Waiting for file to be processed...');
  const startTime = Date.now();
  let fileId: number = 0;

  while (true) {
    const submissionResponse = await wrapper.get({
      endpoint: `/api/submissions/${submissionId}`,
    });
    const submissionBody = await submissionResponse.json();

    if (submissionBody.file) {
      fileId = submissionBody.file as number;
      console.log(`[Setup] fileId: ${fileId}`);
      break;
    }

    if (Date.now() - startTime > POLL_TIMEOUT) {
      throw new Error('[Setup] File processing timed out');
    }

    console.log('[Setup] Waiting for file... 15s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
  /**
 * 7. Poll until static scan done
 After the file is processed, the backend will start running static analysis on it. This can take some time, so we need to poll the file details until 
 we see that the static scan is complete (is_static_done = true) before we can proceed with generating reports. 
 *If we try to generate a report before the static scan is done, it will fail, so this is a necessary step to ensure our setup is correct and our tests will run reliably.
 *The polling mechanism checks the file details every 15 seconds and will timeout after 10 minutes if the static scan hasn't completed,
  which helps prevent our tests from hanging indefinitely if something goes wrong with the file processing.
 */
  console.log('[Setup] Waiting for static scan to complete...');
  while (true) {
    const fileResponse = await wrapper.get({
      endpoint: resolveRoute(API_ROUTES.fileById.route, fileId),
    });
    const fileBody = await fileResponse.json();

    if (fileBody.is_static_done === true) {
      console.log('[Setup] Static scan complete');
      break;
    }

    if (Date.now() - startTime > POLL_TIMEOUT) {
      throw new Error('[Setup] Static scan timed out after 10 minutes');
    }

    console.log('[Setup] Static scan in progress... waiting 15s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  /**
   * 8. Get analysisId
   * With the static scan complete, we can now get the analysisId for our file, which we will need for some of our tests that require an existing analysis. 
   We make a request to the file analyses endpoint with our fileId to get the list of analyses for that file, and we extract the ID of the first analysis in the list. 
   This analysisId will be saved in our state file along with the other IDs for use in our tests.
   */

  const analysisResponse = await wrapper.get({
    endpoint: `${resolveRoute(API_ROUTES.fileAnalyses.route, fileId)}?limit=10`,
  });
  const analysisBody = await analysisResponse.json();

  const riskyAnalysis = analysisBody.results.find(
    (a: Record<string, unknown>) => (a.computed_risk as number) > 0
  );

  const analysisId = riskyAnalysis.id as number;
  const vulnerabilityId = riskyAnalysis.vulnerability as number;
  console.log(
    `[Setup] analysisId: ${analysisId}, vulnerabilityId: ${vulnerabilityId}`
  );
  // const analysisResponse = await wrapper.get({
  //   endpoint: `${resolveRoute(API_ROUTES.fileAnalyses.route, fileId)}?limit=1`,
  // });
  // const analysisBody = await analysisResponse.json();
  // const analysisId = analysisBody.results[0].id as number;
  // const vulnerabilityId = analysisBody.results[0].vulnerability as number;
  // console.log(
  //   `[Setup] analysisId: ${analysisId}, vulnerabilityId: ${vulnerabilityId}`
  // );
  // console.log(`[Setup] analysisId: ${analysisId}`);

  /**
 * 8. Generate report
 * With the file uploaded and static scan complete, we can now generate a report for our file. We make a POST request to the reports endpoint with our fileId, 
 which tells the backend to start generating a report for that file. 
 The response will include a reportId, which we will need to poll for the PDF generation in the next step.
 */
  const generateResponse = await wrapper.post({
    endpoint: resolveRoute(API_ROUTES.reports.route, fileId),
  });
  const generateBody = await generateResponse.json();
  const reportId = generateBody.id as number;
  console.log(`[Setup] Report generated, reportId: ${reportId}`);

  /**
 * 8. Poll until PDF ready
 After requesting report generation, the backend will start processing the report, which includes generating a PDF version of the report. This can take some time,
 so we need to poll the report PDF endpoint until it returns a successful response, which indicates that the PDF is ready to be downloaded.
 */
  console.log('[Setup] Waiting for report PDF to be ready...');
  while (true) {
    const pdfResponse = await wrapper.get({
      endpoint: resolveRoute(API_ROUTES.reportPdf.route, reportId),
    });

    if (pdfResponse.ok()) {
      console.log('[Setup] Report PDF ready');
      break;
    }

    if (Date.now() - startTime > POLL_TIMEOUT) {
      throw new Error('[Setup] Report PDF timed out');
    }

    console.log('[Setup] Report not ready yet... waiting 15s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
  /**
  * 9. Get privacy report ID
  * In addition to the main report, we also want to generate a privacy report for our file. 
  We make a GET request to the privacy report endpoint with our fileId, which will return the details of the privacy report, including its ID. 
  * We save this privacyReportId along with the other IDs in our state file, so that our tests can use it to make API requests related to the privacy report.
  */
  // const privacyReportResponse = await wrapper.get({
  //   endpoint: resolveRoute(API_ROUTES.privacyReport.route, fileId),
  // });
  // const privacyReportBody = await privacyReportResponse.json();
  // const privacyReportId = privacyReportBody.id as number;
  // console.log(`[Setup] privacyReportId: ${privacyReportId}`);

  // // Poll until privacy shield analysis complete
  // console.log('[Setup] Waiting for privacy shield analysis...');
  // while (true) {
  //   const privacyResponse = await wrapper.get({
  //     endpoint: resolveRoute(API_ROUTES.privacyReport.route, fileId),
  //   });
  //   const privacyBody = await privacyResponse.json();

  //   if (privacyBody.privacy_analysis_status === '2') {
  //     console.log('[Setup] Privacy shield analysis complete');
  //     break;
  //   }

  //   if (Date.now() - startTime > POLL_TIMEOUT) {
  //     throw new Error('[Setup] Privacy shield analysis timed out');
  //   }

  //   console.log('[Setup] Privacy shield analysis in progress... waiting 15s');
  //   await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  // }
  console.log('[Setup] Waiting for privacy shield analysis...');
  let privacyReportId: number = 0;

  while (true) {
    const privacyResponse = await wrapper.get({
      endpoint: resolveRoute(API_ROUTES.privacyReport.route, fileId),
    });
    const privacyBody = await privacyResponse.json();

    if (privacyBody.privacy_analysis_status === '2') {
      privacyReportId = privacyBody.id as number;
      console.log(
        `[Setup] Privacy shield complete privacyReportId: ${privacyReportId}`
      );
      break;
    }

    if (Date.now() - startTime > POLL_TIMEOUT) {
      throw new Error('[Setup] Privacy shield analysis timed out');
    }

    console.log('[Setup] Privacy shield in progress... waiting 15s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  // 11. Wait for SBOM scan to complete for our uploaded file
  console.log('[Setup] Waiting for SBOM scan...');
  let sbFileId: number = 0;

  while (true) {
    const sbProjectsResponse = await wrapper.get({
      endpoint: `${API_ROUTES.sbProjects.route}?limit=100`,
    });
    const sbProjectsBody = await sbProjectsResponse.json();
    const mfvaSbProject = sbProjectsBody.results.find(
      (p: Record<string, unknown>) => p.project === projectId
    );

    if (mfvaSbProject) {
      const sbFileResponse = await wrapper.get({
        endpoint: resolveRoute(
          API_ROUTES.sbFileById.route,
          mfvaSbProject.latest_sb_file
        ),
      });
      const sbFileBody = await sbFileResponse.json();

      if (sbFileBody.file === fileId && sbFileBody.status === 3) {
        sbFileId = mfvaSbProject.latest_sb_file as number;
        console.log(`[Setup] SBOM scan complete sbFileId: ${sbFileId}`);
        break;
      }
    }

    if (Date.now() - startTime > POLL_TIMEOUT) {
      throw new Error('[Setup] SBOM scan timed out');
    }

    console.log('[Setup] Waiting for SBOM scan... 15s');
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }

  // 12. Get SBOM report ID
  const sbReportsResponse = await wrapper.get({
    endpoint: resolveRoute(API_ROUTES.sbReports.route, sbFileId),
  });
  const sbReportsBody = await sbReportsResponse.json();
  const sbReportId = sbReportsBody.results[0].id as number;
  console.log(`[Setup] sbReportId: ${sbReportId}`);

  /**
   * 10. Save state
   * Finally, we save all the important IDs we obtained during the setup process (orgId, projectId, fileId, reportId, privacyReportId) to a JSON file in the .state directory.
   * This state file will be read by our tests to get the necessary IDs for making API requests and validating test scenarios. By saving this state at the end of the setup,
    we ensure that all our tests have access to the correct and up-to-date information they need to run successfully.
    * We also clear the tokens from the TokenManager and dispose of the API wrapper to clean up any resources used during the setup process.
   */
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });

  const state = {
    orgId,
    projectId,
    fileId,
    reportId,
    privacyReportId,
    sbFileId,
    sbReportId,
    analysisId,
    vulnerabilityId,
  };
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`[Setup] State saved to ${STATE_FILE}`);
  console.log('[Setup] Done', state);

  TokenManager.clearTokens();
  await wrapper.dispose();
}

export default globalSetup;
