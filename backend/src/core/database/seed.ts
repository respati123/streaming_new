import { logger } from '@core/logger/logger';
import { hashPassword } from '@core/utils/password.util';
import { eq } from 'drizzle-orm';
import { db, queryClient } from './index';
import { donations, streamGoals, streamSettings, streamerbotActions, users } from './schema';

async function seed() {
  logger.info('Starting streaming database seeding...');

  try {
    // 1. Seed Admin User
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, 'admin@respati.stream'),
    });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin12345');

      await db.insert(users).values({
        email: 'admin@respati.stream',
        name: 'Respati Streamer',
        passwordHash: hashedPassword,
        role: 'admin',
        youtubeHandle: '@respati_stream',
        youtubeTitle: 'Respati Live',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      });

      logger.info('✅ Admin user created: admin@respati.stream (password: admin12345)');
    } else {
      logger.info('ℹ️ Demo admin user already exists, skipping.');
    }

    // 2. Seed Default Stream Settings
    const existingSettings = await db.query.streamSettings.findFirst();
    if (!existingSettings) {
      await db.insert(streamSettings).values({
        id: 'default',
        streamerName: 'Respati',
        streamerHandle: '@respati_stream',
        youtubeChannelUrl: 'https://youtube.com/@respati_stream',
        tiktokHandle: '@respati',
        overlayTheme: 'dark_esports',
        alertMinAmount: '10000',
        alertSoundEnabled: true,
      });
      logger.info('✅ Default stream settings seeded.');
    }

    // 3. Seed Default Goals
    const existingGoals = await db.select().from(streamGoals);
    if (existingGoals.length === 0) {
      await db.insert(streamGoals).values([
        {
          title: 'Monthly Sub Goal',
          targetAmount: '100.00',
          currentAmount: '85.00',
          goalType: 'sub',
          isActive: true,
        },
        {
          title: 'New Shure SM7B Microphone',
          targetAmount: '3000000.00',
          currentAmount: '1250000.00',
          goalType: 'donation',
          isActive: true,
        },
      ]);
      logger.info('✅ Initial stream goals seeded.');
    }

    // 4. Seed Streamer.bot Action Deck Buttons
    const existingActions = await db.select().from(streamerbotActions);
    if (existingActions.length === 0) {
      await db.insert(streamerbotActions).values([
        {
          actionId: 'Alert_Donation',
          name: 'Donation Alert (Test)',
          category: 'alerts',
          description: 'Trigger visual donation toast + TTS on stream overlay',
          icon: 'Sparkles',
          color: '#10B981',
          isEnabled: true,
          sortOrder: '1',
        },
        {
          actionId: 'SFX_Airhorn',
          name: 'Airhorn Blast',
          category: 'sound_effects',
          description: 'Play MLG airhorn sound effect on OBS stream',
          icon: 'Volume2',
          color: '#F59E0B',
          isEnabled: true,
          sortOrder: '2',
        },
        {
          actionId: 'OBS_Scene_Gameplay',
          name: 'Switch to Gameplay Scene',
          category: 'obs_control',
          description: 'Switch active OBS scene to Game Capture',
          icon: 'Gamepad2',
          color: '#38BDF8',
          isEnabled: true,
          sortOrder: '3',
        },
        {
          actionId: 'RGB_Victory_Flash',
          name: 'Victory RGB Room Flash',
          category: 'lights',
          description: 'Pulse smart lights in rainbow sequence',
          icon: 'Flame',
          color: '#EC4899',
          isEnabled: true,
          sortOrder: '4',
        },
      ]);
      logger.info('✅ Seeded default Streamer.bot action deck buttons.');
    }

    // 5. Seed Sample Initial Donations
    const existingDonations = await db.select().from(donations);
    if (existingDonations.length === 0) {
      await db.insert(donations).values([
        {
          donorName: 'Budi_Santoso',
          donorEmail: 'budi@example.com',
          amount: '50000.00',
          currency: 'IDR',
          message: 'Semangat streamingnya bang! Tetap konsisten gass 🔥',
          status: 'completed',
          paymentMethod: 'sandbox_qris',
          streamerbotTriggered: true,
        },
        {
          donorName: 'andi_99',
          donorEmail: 'andi@example.com',
          amount: '100000.00',
          currency: 'IDR',
          message: 'Top donation buat traktir kopi pas mabar nanti malam!',
          status: 'completed',
          paymentMethod: 'sandbox_qris',
          streamerbotTriggered: true,
        },
      ]);
      logger.info('✅ Seeded initial sample donations.');
    }

    logger.info('🎉 Streaming database seeding completed successfully.');
  } catch (error) {
    logger.error('Failed to seed streaming database', {}, error as Error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

seed();
