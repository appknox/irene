import path from 'path';
import fs from 'fs';

const env = process.env.ENVIRONMENT || 'qa';
const statePath = path.resolve(__dirname, `../../.state/${env}-state.json`);

export interface TestState {
  orgId: number;
  projectId: number;
  fileId: number;
  reportId: number;
  privacyReportId: number;
  sbFileId: number;
  sbReportId: number;
  analysisId: number;
  vulnerabilityId: number;
  profileId: number;
  features: {
    privacy: boolean;
    sbom: boolean;
    manualscan: boolean;
    dynamicscan_automation: boolean;
    upload_via_url: boolean;
  };
}

const state: TestState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
export default state;
