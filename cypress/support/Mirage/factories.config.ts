import type { FactoryDefinition } from 'miragejs/-types';

import FileFactory from 'irene/mirage/factories/file';
import User from 'irene/mirage/factories/user';
import FileRiskFactory from 'irene/mirage/factories/file-risk';
import AnalysisFactory from 'irene/mirage/factories/analysis';
import SbomProjectFactory from 'irene/mirage/factories/sbom-project';
import SbomFileFactory from 'irene/mirage/factories/sbom-file';
import ProjectFactory from 'irene/mirage/factories/project';
import VulnerabilityFactory from 'irene/mirage/factories/vulnerability';
import UnknownAnalysisStatus from 'irene/mirage/factories/unknown-analysis-status';
import OrganizationMember from 'irene/mirage/factories/organization-member';
import UploadApp from 'irene/mirage/factories/upload-app';
import UploadAppLink from 'irene/mirage/factories/upload-app-link';
import Submission from 'irene/mirage/factories/submission';
import DeviceFactory from 'irene/mirage/factories/device';

import type { BASE_FACTORY_DEF } from 'irene/mirage/factories/base';
import type { FILE_FACTORY_DEF } from 'irene/mirage/factories/file';
import type { USER_FACTORY_DEF } from 'irene/mirage/factories/user';
import type { FILE_RISK_FACTORY_DEF } from 'irene/mirage/factories/file-risk';
import type { ANALYSIS_FACTORY_DEF } from 'irene/mirage/factories/analysis';
import type { SBOM_PROJECT_FACTORY_DEF } from 'irene/mirage/factories/sbom-project';
import type { SBOM_FILE_FACTORY_DEF } from 'irene/mirage/factories/sbom-file';
import type { PROJECT_FACTORY_DEF } from 'irene/mirage/factories/project';
import type { VULNERABLITY_FACTORY_DEF } from 'irene/mirage/factories/vulnerability';
import type { UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF } from 'irene/mirage/factories/unknown-analysis-status';
import type { ORGANIZATION_MEMBER_FACTORY_DEF } from 'irene/mirage/factories/organization-member';
import type { UPLOAD_APP_FACTORY_DEF } from 'irene/mirage/factories/upload-app';
import type { UPLOAD_APP_LINK_FACTORY_DEF } from 'irene/mirage/factories/upload-app-link';
import type { SUBMISSION_FACTORY_DEF } from 'irene/mirage/factories/submission';
import type { DEVICE_FACTORY_DEF } from 'irene/mirage/factories/device';

// Extract factory method return values from a factory definition
export type FlattenFactoryMethods<T> = {
  [K in keyof T]: T[K] extends (n: number) => infer V ? V : T[K];
};

/**
 * Represents api responses for each model type
 */
export type IncludeBaseFactoryProps<T> = FlattenFactoryMethods<T> &
  FlattenFactoryMethods<typeof BASE_FACTORY_DEF>;

export type AnalysisModelFactoryDef = FlattenFactoryMethods<
  typeof ANALYSIS_FACTORY_DEF & {
    id: number;
    vulnerability: number;
    overridden_by: string;
    overridden_date: Date;
    overridden_risk: number;
    overridden_risk_comment: string;
    override_criteria: string;
    file: number;
  }
>;

export interface MirageFactoryDefProps {
  user: FlattenFactoryMethods<typeof USER_FACTORY_DEF>;
  'upload-app': FlattenFactoryMethods<typeof UPLOAD_APP_FACTORY_DEF>;
  'upload-app-link': FlattenFactoryMethods<typeof UPLOAD_APP_LINK_FACTORY_DEF>;
  'sbom-file': FlattenFactoryMethods<typeof SBOM_FILE_FACTORY_DEF>;
  'sbom-project': FlattenFactoryMethods<typeof SBOM_PROJECT_FACTORY_DEF>;
  'available-manual-device': FlattenFactoryMethods<typeof DEVICE_FACTORY_DEF>;
  'file-risk': FlattenFactoryMethods<typeof FILE_RISK_FACTORY_DEF>;

  submission: FlattenFactoryMethods<
    typeof SUBMISSION_FACTORY_DEF & {
      file: number;
    }
  >;

  'organization-member': FlattenFactoryMethods<
    typeof ORGANIZATION_MEMBER_FACTORY_DEF
  >;

  // Contains base factory props
  project: IncludeBaseFactoryProps<typeof PROJECT_FACTORY_DEF> & {
    last_file: IncludeBaseFactoryProps<typeof FILE_FACTORY_DEF>;
  };

  vulnerability: IncludeBaseFactoryProps<typeof VULNERABLITY_FACTORY_DEF>;

  analysis: AnalysisModelFactoryDef;

  'unknown-analysis-status': IncludeBaseFactoryProps<
    typeof UNKNOWN_ANALYSIS_STATUS_FACTORY_DEF
  >;

  file: IncludeBaseFactoryProps<
    typeof FILE_FACTORY_DEF & {
      project: number;
      executable_name: string;
      analyses: Array<AnalysisModelFactoryDef>;
    }
  >;
}

/**
 * Mirage Model Factories for data mocking
 */
const MIRAGE_FACTORIES: Record<
  keyof MirageFactoryDefProps,
  FactoryDefinition<object>
> = {
  file: FileFactory,
  project: ProjectFactory,
  vulnerability: VulnerabilityFactory,
  analysis: AnalysisFactory,
  'unknown-analysis-status': UnknownAnalysisStatus,
  'organization-member': OrganizationMember,
  user: User,
  'upload-app': UploadApp,
  'upload-app-link': UploadAppLink,
  submission: Submission,
  'sbom-file': SbomFileFactory,
  'sbom-project': SbomProjectFactory,
  'available-manual-device': DeviceFactory,
  'file-risk': FileRiskFactory,
};

export { MIRAGE_FACTORIES };
