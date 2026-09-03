import agoraToken from 'agora-access-token';
import { config } from '../../config/index.js';

const { RtcTokenBuilder, RtcRole } = agoraToken as any;

export function generateAgoraToken(
  channel: string,
  uid: number | string = 0,
  role: 'publisher' | 'subscriber' = 'publisher',
  expireTimeSeconds: number = 3600
): { token: string; appId: string; channel: string; uid: number | string } {
  const appId = config.agora.appId;
  const appCert = config.agora.appCertificate;

  if (!appId) {
    throw new Error('AGORA_APP_ID is not configured');
  }

  // If App Certificate is absent (testing mode), return blank token
  if (!appCert) {
    return { token: '', appId, channel, uid };
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeSeconds;
  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  let token = '';
  if (typeof uid === 'number') {
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCert, channel, uid, rtcRole, privilegeExpiredTs);
  } else {
    token = RtcTokenBuilder.buildTokenWithUserAccount(appId, appCert, channel, uid, rtcRole, privilegeExpiredTs);
  }

  return { token, appId, channel, uid };
}
