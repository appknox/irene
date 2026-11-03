import AuthenticatedDashboardSbomScanDetailsRoute from './scan-details';

/**
 * The unfiltered component list for one scan.
 *
 * A sibling of `scan-details` rather than a child of it: the breadcrumb chain
 * comes from the controller's crumb props (see `component-details`, which does
 * the same), so nesting buys nothing and would mean splitting `scan-details`
 * into an index route. The model and query params are inherited unchanged —
 * both views load the same scan.
 */
export default class AuthenticatedDashboardSbomOriginalAnalysisRoute extends AuthenticatedDashboardSbomScanDetailsRoute {}
