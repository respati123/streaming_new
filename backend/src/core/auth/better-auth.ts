import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { dash } from '@better-auth/infra';
import { db } from '@core/database';
import * as schema from '@core/database/schema';
import { env } from '@core/config/env';
import { pointsService } from '@modules/points/points.service';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_API_KEY || env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    env.FRONTEND_URL,
    env.BETTER_AUTH_URL,
  ],
  plugins: [
    dash(),
  ],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
      redirectURI: env.GOOGLE_REDIRECT_URI,
      prompt: 'select_account consent',
      accessType: 'offline',
      scope: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
      async getUserInfo(tokens) {
        const accessToken = tokens.accessToken;
        let youtubeChannelId: string | null = null;
        let youtubeHandle: string | null = null;
        let youtubeChannelTitle: string | null = null;
        let youtubeAvatar: string | null = null;

        // 1. Fetch Google User Profile
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profile = await res.json();

        // 2. Fetch YouTube Channel Details
        try {
          const ytRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            if (ytData.items && ytData.items.length > 0) {
              const channel = ytData.items[0];
              youtubeChannelId = channel.id;
              youtubeChannelTitle = channel.snippet?.title || null;
              youtubeHandle = channel.snippet?.customUrl || null;
              youtubeAvatar = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || null;
            }
          }
        } catch (e) {
          console.warn('[YouTube API] Failed to fetch channel details:', e);
        }

        return {
          user: {
            id: profile.sub,
            name: youtubeChannelTitle || profile.name,
            email: profile.email,
            image: youtubeAvatar || profile.picture,
            emailVerified: profile.email_verified,
            youtubeChannelId,
            youtubeHandle,
            youtubeChannelTitle,
            points: 0,
            tier: 'bronze',
            totalChatCount: 0,
            totalDonationAmount: 0,
          },
          data: profile,
        };
      },
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (accountRecord) => {
          if (accountRecord.providerId === 'google' && accountRecord.accessToken) {
            await pointsService.syncYouTubeProfile(accountRecord.userId, accountRecord.accessToken);
          }
        },
      },
      update: {
        after: async (accountRecord) => {
          if (accountRecord.providerId === 'google' && accountRecord.accessToken) {
            await pointsService.syncYouTubeProfile(accountRecord.userId, accountRecord.accessToken);
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'viewer',
        required: false,
      },
      youtubeChannelId: {
        type: 'string',
        required: false,
      },
      youtubeHandle: {
        type: 'string',
        required: false,
      },
      youtubeChannelTitle: {
        type: 'string',
        required: false,
      },
      points: {
        type: 'number',
        defaultValue: 0,
        required: false,
      },
      tier: {
        type: 'string',
        defaultValue: 'bronze',
        required: false,
      },
      totalChatCount: {
        type: 'number',
        defaultValue: 0,
        required: false,
      },
      totalDonationAmount: {
        type: 'number',
        defaultValue: 0,
        required: false,
      },
    },
  },
});
