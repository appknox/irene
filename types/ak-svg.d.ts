import { ComponentLike } from '@glint/template';

export enum AkSvgComponentInvocationByNames {
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
}

export enum AkSvgComponentInvocationByPaths {
  'json-report',
  'pdf-report',
  'xlsx-icon',
  'csv-icon',
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
