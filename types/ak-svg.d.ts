import { ComponentLike } from '@glint/template';

export enum AkSvgComponentInvocationByNames {
  AmPlaystoreLogo,
  AppMonitoringTableEmpty,
  JsonReport,
  NotificationEmpty,
  OrgDataEmpty,
  OrgInvitationEmpty,
  OrgNameAddEditSuccess,
  OrgNamespaceEmpty,
  OrgUsersEmpty,
  PdfReport,
  EmptyLoadingList,
  NoResult,
  GenerateReport,
  FileNotFound,
  InProgress,
  XlsxIcon,
  CsvIcon,
  NoVulnerability,
  TeamsEmpty,
  ThumbsUpIcon,
  NoDataFound,
  FileCompareError,
  NoInsights,
  NoTestCase,
  AffectedFixedVersionEmpty,
  MainLoaderImage1,
  MainLoaderImage2,
  MainLoaderImage3,
  AppstoreLogo,
  PlaystoreLogo,
  NoParameterData,
  ProjectListEmpty,
  SeverityOverrideSuccess,
  SeverityResetSuccess,
  AmVersionUploadError,
  ScanProgress,
  ScanCompleted,
  NoApisCaptured,
  DastAutomationUpselling,
  NoApiUrlFilter,
  ToggleAutomatedDast,
  AppknoxBgImg,
  StoreknoxBgImg,
  SecurityBgImg,
  VaptIndicator,
  SmIndicator,
  SecurityIndicator,
  StoreknoxSearchApps,
  StoreknoxPlaystoreLogo,
  SmIndicator,
  VaptIndicator,
  InfoIndicator,
  NoPendingItems,
  WelcomeToStoreknox,
}

export enum AkSvgComponentInvocationByPaths {
  'json-report',
  'pdf-report',
  'xlsx-icon',
  'csv-icon',
  'public-api-icon',
  'no-api-url-filter',
}

type AkSvgComponent = ComponentLike<{
  Element: SVGElement;
}>;

type AkSvgRegistry = {
  [k in `AkSvg::${keyof typeof AkSvgComponentInvocationByNames}`]: AkSvgComponent;
} & {
  [k in `ak-svg/${keyof typeof AkSvgComponentInvocationByPaths}`]: AkSvgComponent;
};

export default AkSvgRegistry;
