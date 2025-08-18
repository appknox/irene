import { ErrorContext } from './messages/error/context';
import { NfUpldfailpayrq1Context } from './messages/nf-upldfailpayrq1/context';
import { NfUpldfailpay2Context } from './messages/nf-upldfailpay2/context';
import { NfUpldfailnscreatd1Context } from './messages/nf-upldfailnscreatd1/context';
import { NfUpldfailnsunaprv1Context } from './messages/nf-upldfailnsunaprv1/context';
import { NfUpldfailnprjdeny1Context } from './messages/nf-upldfailnprjdeny1/context';
import { NfUpldfailnprjdeny2Context } from './messages/nf-upldfailnprjdeny2/context';
import { NfNsreqstd1Context } from './messages/nf-nsreqstd1/context';
import { NfNsreqstd2Context } from './messages/nf-nsreqstd2/context';
import { NfNsautoapprvd1Context } from './messages/nf-nsautoapprvd1/context';
import { NfNsautoapprvd2Context } from './messages/nf-nsautoapprvd2/context';
import { NfNsapprvd1Context } from './messages/nf-nsapprvd1/context';
import { NfNsapprvd2Context } from './messages/nf-nsapprvd2/context';
import { NfNsrejctd1Context } from './messages/nf-nsrejctd1/context';
import { NfNsrejctd2Context } from './messages/nf-nsrejctd2/context';
import { NfSastcmpltd1Context } from './messages/nf-sastcmpltd1/context';
import { NfDastcmpltd1Context } from './messages/nf-dastcmpltd1/context';
import { NfApistcmpltd1Context } from './messages/nf-apistcmpltd1/context';
import { NfAmNewversnContext } from './messages/nf-am-newversn/context';
import { NfSkNewversnContext } from './messages/nf-sk-newversn/context';
import { NfSbomcmpltdContext } from './messages/nf-sbomcmpltd/context';
import { NfStrUrlUpldfailpayrq1Context } from './messages/nf-str-url-upldfailpayrq1/context';
import { NfStrUrlUpldfailpay2Context } from './messages/nf-str-url-upldfailpay2/context';
import { NfStrUrlUpldfailnscreatd1Context } from './messages/nf-str-url-upldfailnscreatd1/context';
import { NfStrUrlNsreqstd1Context } from './messages/nf-str-url-nsreqstd1/context';
import { NfStrUrlUpldfailnsunaprv1Context } from './messages/nf-str-url-upldfailnsunaprv1/context';
import { NfStrUrlNsreqstd2Context } from './messages/nf-str-url-nsreqstd2/context';
import { NfStrUrlUpldfailnprjdeny1Context } from './messages/nf-str-url-upldfailnprjdeny1/context';
import { NfStrUrlUpldfailnprjdeny2Context } from './messages/nf-str-url-upldfailnprjdeny2/context';
import { NfStrUrlVldtnErrContext } from './messages/nf-str-url-vldtn-err/context';
import { NfStrUrlUploadSuccessContext } from './messages/nf-str-url-upload-success/context';
import { NfSystmFileUploadSuccessContext } from './messages/nf-systm-file-upload-success/context';
import { NfAutomatedDastCompletedContext } from './messages/nf-automated-dast-completed/context';
import { NfAutomatedDastErroredContext } from './messages/nf-automated-dast-errored/context';
import { NfAutomatedDastInProgressContext } from './messages/nf-automated-dast-in-progress/context';
import { NfPublicApiUserUpdatedContext } from './messages/nf-public-api-user-updated/context';

export const NotificationMap = {
  ERROR: {
    component: 'notifications-page/messages/error' as const,
    context: ErrorContext,
  },
  NF_UPLDFAILPAYRQ1: {
    component: 'notifications-page/messages/nf-upldfailpayrq1' as const,
    context: NfUpldfailpayrq1Context,
  },
  NF_UPLDFAILPAY2: {
    component: 'notifications-page/messages/nf-upldfailpay2' as const,
    context: NfUpldfailpay2Context,
  },
  NF_UPLDFAILNSCREATD1: {
    component: 'notifications-page/messages/nf-upldfailnscreatd1' as const,
    context: NfUpldfailnscreatd1Context,
  },
  NF_UPLDFAILNSUNAPRV1: {
    component: 'notifications-page/messages/nf-upldfailnsunaprv1' as const,
    context: NfUpldfailnsunaprv1Context,
  },
  NF_UPLDFAILNPRJDENY1: {
    component: 'notifications-page/messages/nf-upldfailnprjdeny1' as const,
    context: NfUpldfailnprjdeny1Context,
  },
  NF_UPLDFAILNPRJDENY2: {
    component: 'notifications-page/messages/nf-upldfailnprjdeny2' as const,
    context: NfUpldfailnprjdeny2Context,
  },
  NF_NSREQSTD1: {
    component: 'notifications-page/messages/nf-nsreqstd1' as const,
    context: NfNsreqstd1Context,
  },
  NF_NSREQSTD2: {
    component: 'notifications-page/messages/nf-nsreqstd2' as const,
    context: NfNsreqstd2Context,
  },
  NF_NSAUTOAPPRVD1: {
    component: 'notifications-page/messages/nf-nsautoapprvd1' as const,
    context: NfNsautoapprvd1Context,
  },
  NF_NSAUTOAPPRVD2: {
    component: 'notifications-page/messages/nf-nsautoapprvd2' as const,
    context: NfNsautoapprvd2Context,
  },
  NF_NSAPPRVD1: {
    component: 'notifications-page/messages/nf-nsapprvd1' as const,
    context: NfNsapprvd1Context,
  },
  NF_NSAPPRVD2: {
    component: 'notifications-page/messages/nf-nsapprvd2' as const,
    context: NfNsapprvd2Context,
  },
  NF_NSREJCTD1: {
    component: 'notifications-page/messages/nf-nsrejctd1' as const,
    context: NfNsrejctd1Context,
  },
  NF_NSREJCTD2: {
    component: 'notifications-page/messages/nf-nsrejctd2' as const,
    context: NfNsrejctd2Context,
  },
  NF_SASTCMPLTD1: {
    component: 'notifications-page/messages/nf-sastcmpltd1' as const,
    context: NfSastcmpltd1Context,
  },
  NF_DASTCMPLTD1: {
    component: 'notifications-page/messages/nf-dastcmpltd1' as const,
    context: NfDastcmpltd1Context,
  },
  NF_APISTCMPLTD1: {
    component: 'notifications-page/messages/nf-apistcmpltd1' as const,
    context: NfApistcmpltd1Context,
  },
  NF_SK_NEWVERSN: {
    component: 'notifications-page/messages/nf-sk-newversn' as const,
    context: NfSkNewversnContext,
  },
  NF_AM_NEWVERSN: {
    component: 'notifications-page/messages/nf-am-newversn' as const,
    context: NfAmNewversnContext,
  },
  NF_SBOMCMPLTD: {
    component: 'notifications-page/messages/nf-sbomcmpltd' as const,
    context: NfSbomcmpltdContext,
  },
  NF_STR_URL_UPLDFAILPAYRQ1: {
    component: 'notifications-page/messages/nf-str-url-upldfailpayrq1' as const,
    context: NfStrUrlUpldfailpayrq1Context,
  },
  NF_STR_URL_UPLDFAILPAY2: {
    component: 'notifications-page/messages/nf-str-url-upldfailpay2' as const,
    context: NfStrUrlUpldfailpay2Context,
  },
  NF_STR_URL_UPLDFAILNSCREATD1: {
    component:
      'notifications-page/messages/nf-str-url-upldfailnscreatd1' as const,
    context: NfStrUrlUpldfailnscreatd1Context,
  },
  NF_STR_URL_NSREQSTD1: {
    component: 'notifications-page/messages/nf-str-url-nsreqstd1' as const,
    context: NfStrUrlNsreqstd1Context,
  },
  NF_STR_URL_UPLDFAILNSUNAPRV1: {
    component:
      'notifications-page/messages/nf-str-url-upldfailnsunaprv1' as const,
    context: NfStrUrlUpldfailnsunaprv1Context,
  },
  NF_STR_URL_NSREQSTD2: {
    component: 'notifications-page/messages/nf-str-url-nsreqstd2' as const,
    context: NfStrUrlNsreqstd2Context,
  },
  NF_STR_URL_UPLDFAILNPRJDENY1: {
    component:
      'notifications-page/messages/nf-str-url-upldfailnprjdeny1' as const,
    context: NfStrUrlUpldfailnprjdeny1Context,
  },
  NF_STR_URL_UPLDFAILNPRJDENY2: {
    component:
      'notifications-page/messages/nf-str-url-upldfailnprjdeny2' as const,
    context: NfStrUrlUpldfailnprjdeny2Context,
  },
  NF_STR_URL_VLDTN_ERR: {
    component: 'notifications-page/messages/nf-str-url-vldtn-err' as const,
    context: NfStrUrlVldtnErrContext,
  },
  NF_STR_URL_UPLOAD_SUCCESS: {
    component: 'notifications-page/messages/nf-str-url-upload-success' as const,
    context: NfStrUrlUploadSuccessContext,
  },
  NF_SYSTM_FILE_UPLOAD_SUCCESS: {
    component:
      'notifications-page/messages/nf-systm-file-upload-success' as const,
    context: NfSystmFileUploadSuccessContext,
  },
  NF_AUTOMATED_DAST_COMPLETED: {
    component:
      'notifications-page/messages/nf-automated-dast-completed' as const,
    context: NfAutomatedDastCompletedContext,
  },
  NF_AUTOMATED_DAST_ERRORED: {
    component: 'notifications-page/messages/nf-automated-dast-errored' as const,
    context: NfAutomatedDastErroredContext,
  },
  NF_AUTOMATED_DAST_IN_PROGRESS: {
    component:
      'notifications-page/messages/nf-automated-dast-in-progress' as const,
    context: NfAutomatedDastInProgressContext,
  },
  NF_PUBLIC_API_USER_UPDATED: {
    component:
      'notifications-page/messages/nf-public-api-user-updated' as const,
    context: NfPublicApiUserUpdatedContext,
  },
} satisfies Record<string, { component: string; context: unknown }>;

// Notification contexts
export type NotificationContexts = {
  [K in keyof typeof NotificationMap]: (typeof NotificationMap)[K]['context'];
};

export type NotificationMessageKey = keyof typeof NotificationMap;
