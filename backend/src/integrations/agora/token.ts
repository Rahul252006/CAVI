import agoraToken from 'agora-access-token';
import { config } from '../../config/index.js';

const { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } = agoraToken as any;

export function generateAgoraToken(
  channel: string,
  uid: number | string = 0,
  role: 'publisher' | 'subscriber' = 'publisher',
  expireTimeSeconds: number = 3600
): { token: string; rtmToken: string; appId: string; channel: string; uid: number | string; rtmUserId: string } {
  const appId = config.agora.appId;
  const appCert = config.agora.appCertificate;

  if (!appId) {
    throw new Error('AGORA_APP_ID is not configured');
  }

  const rtmUserId = typeof uid === 'string' ? uid : `user_${uid || Math.floor(Math.random() * 899999 + 100000)}`;

  if (!appCert) {
    return { token: '', rtmToken: '', appId, channel, uid, rtmUserId };
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

  let rtmToken = '';
  try {
    rtmToken = RtmTokenBuilder.buildToken(appId, appCert, rtmUserId, RtmRole.Rtm_User, privilegeExpiredTs);
  } catch (err) {
    console.warn('[AgoraToken] Failed to build RTM token:', err);
  }

  return { token, rtmToken, appId, channel, uid, rtmUserId };
}
