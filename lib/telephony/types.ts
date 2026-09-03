export type TelephonyProvider = 'agora_sip' | 'twilio' | 'telnyx' | 'generic_sip' | 'simulated';

export type InboundCallPayload = {
  From: string; // Caller's real mobile phone number (e.g. +919876543210)
  To: string;   // Company-owned customer care number dialed (e.g. +918005551111)
  CallSid?: string;
  CallStatus?: string;
  Direction?: 'inbound' | 'outbound';
  Carrier?: string;
};

export type OutboundCallRequest = {
  companyId: string;
  companySupportPhone: string;
  customerPhone: string;
  caseId?: string;
  agentId?: string;
};

export type TelephonyStatus = {
  isPstnConfigured: boolean;
  provider: TelephonyProvider;
  inboundWebhookUrl: string;
  sipUri: string;
  companiesMapped: Array<{
    companyId: string;
    companyName: string;
    supportPhone: string;
    status: 'active' | 'pending_forwarding';
  }>;
  requiredEnvVars: {
    TWILIO_ACCOUNT_SID?: boolean;
    TWILIO_AUTH_TOKEN?: boolean;
    AGORA_SIP_GATEWAY_URL?: boolean;
    NEXT_PUBLIC_APP_URL?: boolean;
  };
};
