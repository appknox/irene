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
  NF_AM_NEWVERSN: {
    component: 'notifications-page/messages/nf-am-newversn' as const,
    context: NfAmNewversnContext,
  },
} satisfies Record<string, { component: string; context: unknown }>;

export type NotificationMessageKey = keyof typeof NotificationMap;
