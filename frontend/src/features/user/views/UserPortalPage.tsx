import { signIn, signOut, useSession } from '@core/auth/authClient';
import { viewerSocket } from '@core/ws/socketClient';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import {
  RiChat1Line,
  RiCoinLine,
  RiDashboardFill,
  RiFireFill,
  RiFlashlightFill,
  RiGoogleFill,
  RiHeart3Fill,
  RiInformationLine,
  RiLogoutBoxRLine,
  RiMagicFill,
  RiPlayFill,
  RiRobot2Fill,
  RiSendPlane2Fill,
  RiShieldCheckFill,
  RiSparklingFill,
  RiUser3Fill,
  RiVipCrownFill,
  RiVolumeUpLine,
  RiYoutubeFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { type DonationPaymentStatus, donationService } from '../services/donationService';

interface ViewerProfile {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  youtubeHandle?: string | null;
  youtubeChannelTitle?: string | null;
  tier?: string | null;
  points?: number;
  totalChatCount?: number;
  totalDonationAmount?: number;
}

const AI_PROMPT_PRESETS = [
  'Bagi tips & trik GG main game ini dong!',
  'Coba roasting gameplay streamer hari ini dengan savage tapi lucu!',
  'Tebak sifat & aura streamer dari cara mainnya sekarang!',
  'Kasih tebak-tebakan bapak-bapak yang bikin streamer ngakak!',
  'Nasihat motivasi random ala Gen-Z buat yang lagi nonton live.',
];

export default function UserPortalPage() {
  const { data: session, isPending } = useSession();
  const viewerProfile = session?.user as ViewerProfile | undefined;

  // Active Interactive Tab
  const [activeTab, setActiveTab] = useState<'chatai' | 'donation' | 'chat'>('chatai');

  // Live Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatSentNotice, setChatSentNotice] = useState(false);

  // Chat AI Donation States (Min. Rp 5.000)
  const [aiPrompt, setAiPrompt] = useState('Bagi tips GG main game dong!');
  const [aiAmount, setAiAmount] = useState(5000);

  // Standard Tip Donation States (Min. Rp 5.000)
  const [donorAmount, setDonorAmount] = useState(10000);
  const [donorMessage, setDonorMessage] = useState('Semangat live-nya bang! GGWP 🔥⚡');
  const [selectedTemplate, setSelectedTemplate] = useState<'electric-lightning' | 'fire-glass'>(
    'fire-glass'
  );

  // Shared Payment / QRIS States
  const [donationPayment, setDonationPayment] = useState<DonationPaymentStatus | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const pendingOrderId = donationPayment?.status === 'pending' ? donationPayment.orderId : null;

  // Handle Google OAuth Sign In
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setLoginError(null);
      const res = await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/user`,
      });
      if (res?.error) {
        setLoginError(res.error.message || 'Gagal memulai autentikasi Google');
        setIsSubmitting(false);
      }
    } catch (error: unknown) {
      console.error('Google Sign In failed:', error);
      setLoginError(
        error instanceof Error ? error.message : 'Gagal menghubungi server Better Auth'
      );
      setIsSubmitting(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          },
        },
      });
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  // Connect viewer socket on mount
  useEffect(() => {
    viewerSocket.connect();
  }, []);

  // Handle Sending Chat to Live Stream Overlay
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userObj = viewerProfile;
    const displayName = userObj?.youtubeHandle || userObj?.name || 'Google Viewer';
    const avatarUrl = userObj?.image || null;

    viewerSocket.send('chat:send', {
      userId: userObj?.id,
      message: chatInput.trim(),
      username: displayName,
      youtubeHandle: userObj?.youtubeHandle,
      userAvatarUrl: avatarUrl,
      isOwner: false,
      isModerator: false,
      isSponsor: true, // Google authenticated viewer gets verified sponsor rank
      isVerified: true,
    });

    setChatInput('');
    setChatSentNotice(true);
    setTimeout(() => setChatSentNotice(false), 3000);
  };

  // Generate QR Code image Data URL when qrString is received
  useEffect(() => {
    if (!donationPayment?.qrString) {
      setQrImageUrl(null);
      return;
    }

    let disposed = false;
    QRCode.toDataURL(donationPayment.qrString, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#09090b', light: '#ffffff' },
    })
      .then((url: string) => {
        if (!disposed) setQrImageUrl(url);
      })
      .catch(() => {
        if (!disposed)
          setPaymentError('QRIS gagal ditampilkan. Gunakan tombol halaman pembayaran.');
      });

    return () => {
      disposed = true;
    };
  }, [donationPayment?.qrString]);

  // Poll QRIS payment status every 3 seconds while pending
  useEffect(() => {
    if (!pendingOrderId) return;
    let disposed = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const next = await donationService.getPaymentStatus(pendingOrderId);
        if (disposed) return;
        setDonationPayment(next);
        if (next.status === 'pending') timer = window.setTimeout(poll, 3000);
      } catch (error) {
        if (!disposed) {
          setPaymentError(error instanceof Error ? error.message : 'Gagal mengecek status QRIS.');
          timer = window.setTimeout(poll, 5000);
        }
      }
    };

    timer = window.setTimeout(poll, 3000);
    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [pendingOrderId]);

  // Create a real QRIS transaction for Chat AI (min Rp 5.000)
  const handleSendAiDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiAmount < 5000 || !aiPrompt.trim() || isSubmitting) return;

    const userObj = viewerProfile;
    const donorName = userObj?.youtubeHandle || userObj?.name || 'Google Supporter';
    setIsSubmitting(true);
    setPaymentError(null);
    setDonationPayment(null);
    try {
      const payment = await donationService.createQrPayment({
        amount: Math.max(5000, aiAmount),
        donorName,
        donorEmail: userObj?.email || undefined,
        message: `!chatai ${aiPrompt.trim()}`,
        isChatAi: true,
        aiPrompt: aiPrompt.trim(),
      });
      setDonationPayment(payment);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Gagal membuat transaksi QRIS Chat AI.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Dev Simulation for Chat AI (bypasses QR payment for rapid testing)
  const handleSimulateAiDonation = async () => {
    if (aiAmount < 5000 || !aiPrompt.trim() || isSubmitting) return;

    const userObj = viewerProfile;
    const donorName = userObj?.youtubeHandle || userObj?.name || 'Google Supporter';
    setIsSubmitting(true);
    setPaymentError(null);
    try {
      const payment = await donationService.simulateDonation({
        amount: Math.max(5000, aiAmount),
        donorName,
        donorEmail: userObj?.email || undefined,
        message: `!chatai ${aiPrompt.trim()}`,
        isChatAi: true,
        aiPrompt: aiPrompt.trim(),
      });
      setDonationPayment(payment);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Gagal menjalankan simulasi Chat AI.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a standard Tip Donation transaction
  const handleSendDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (donorAmount < 5000 || isSubmitting) return;

    const userObj = viewerProfile;
    const donorName = userObj?.youtubeHandle || userObj?.name || 'Google Supporter';
    setIsSubmitting(true);
    setPaymentError(null);
    setDonationPayment(null);
    try {
      const payment = await donationService.createQrPayment({
        amount: Math.max(5000, donorAmount),
        donorName,
        donorEmail: userObj?.email || undefined,
        message: donorMessage,
        template: selectedTemplate,
      });
      setDonationPayment(payment);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Gagal membuat transaksi QRIS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Dev Simulation for Standard Tip
  const handleSimulateDonation = async () => {
    if (donorAmount < 5000 || isSubmitting) return;

    const userObj = viewerProfile;
    const donorName = userObj?.youtubeHandle || userObj?.name || 'Google Supporter';
    setIsSubmitting(true);
    setPaymentError(null);
    try {
      const payment = await donationService.simulateDonation({
        amount: Math.max(5000, donorAmount),
        donorName,
        donorEmail: userObj?.email || undefined,
        message: donorMessage,
        template: selectedTemplate,
      });
      setDonationPayment(payment);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Gagal menjalankan simulasi donasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-violet-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-violet-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[420px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 -left-40 w-[500px] h-[400px] bg-amber-600/10 blur-[140px] rounded-full" />
      </div>

      {/* ─── NAVIGATION BAR ─── */}
      <header className="relative z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/25">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <RiRobot2Fill className="text-violet-400 text-xl animate-pulse" />
              </div>
            </div>
            <div>
              <div className="font-black text-base tracking-tight flex items-center gap-2">
                <span>VIEWER HUB</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  AI & QRIS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Portal Interaksi Penonton & Chat AI Oracle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <RiDashboardFill className="text-sm text-cyan-400" />
              <span>Admin Stream Deck</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading State */}
        {isPending && (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-zinc-400 font-mono">Memeriksa sesi Google Better Auth...</p>
          </div>
        )}

        {/* ─── SECTION A: NOT LOGGED IN (GOOGLE AUTH PROMPT) ─── */}
        {!isPending && !session && (
          <div className="max-w-md mx-auto py-12">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl p-8 shadow-2xl shadow-black/80 text-center relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                <RiUser3Fill className="text-3xl text-violet-400" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Login Penonton</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Masuk menggunakan akun <strong>Google</strong> melalui <strong>Better Auth</strong>{' '}
                untuk bertanya ke <strong>Chat AI</strong> dan berinteraksi di live stream dengan nama & avatar asli Anda.
              </p>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg shadow-white/10 disabled:opacity-50 cursor-pointer"
              >
                <RiGoogleFill className="text-xl text-red-500 group-hover:scale-110 transition-transform" />
                <span>{isSubmitting ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}</span>
              </button>

              {loginError && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold text-left flex items-start gap-2">
                  <RiInformationLine className="text-base text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
                <RiShieldCheckFill className="text-emerald-400" />
                <span>Powered by Better Auth & OAuth 2.0</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION B: LOGGED IN USER CONTROL PANEL ─── */}
        {!isPending && session && (
          <div className="space-y-6">
            {/* Top User Profile Header Banner */}
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-violet-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Google Avatar */}
                <div className="relative">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-400/80 shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-violet-950 border-2 border-violet-400 flex items-center justify-center text-violet-400 font-black text-2xl">
                      {session.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-zinc-950 flex items-center justify-center shadow">
                    <RiShieldCheckFill className="text-black text-xs" />
                  </div>
                </div>

                {/* User Details */}
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                      {viewerProfile?.youtubeChannelTitle || session.user.name}
                    </h1>
                    {viewerProfile?.youtubeHandle && (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1 shadow-xs">
                        <RiYoutubeFill className="text-red-500" />
                        <span>{viewerProfile.youtubeHandle}</span>
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-xs font-mono font-bold flex items-center gap-1">
                      <RiGoogleFill className="text-red-400" />
                      <span>Google Verified</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold flex items-center gap-1">
                      <RiVipCrownFill className="text-amber-400" />
                      <span className="uppercase font-mono">
                        Tier: {viewerProfile?.tier || 'Bronze'}
                      </span>
                    </span>
                  </div>

                  <p className="text-sm text-zinc-400 font-mono mt-1">{session.user.email}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs font-mono flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-amber-300 font-bold">
                      <RiSparklingFill className="text-amber-400" />
                      <span>
                        {Number(viewerProfile?.points || 0).toLocaleString('id-ID')} Loyalty PTS
                      </span>
                    </div>
                    <span className="text-zinc-500">
                      Chats:{' '}
                      <strong className="text-zinc-300">
                        {viewerProfile?.totalChatCount || 0}
                      </strong>
                    </span>
                    <span className="text-zinc-500">
                      Total Sawer:{' '}
                      <strong className="text-emerald-400">
                        Rp {Number(viewerProfile?.totalDonationAmount || 0).toLocaleString('id-ID')}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-red-950/60 hover:text-red-300 border border-zinc-700 hover:border-red-500/40 text-xs font-semibold text-zinc-300 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RiLogoutBoxRLine className="text-sm" />
                <span>Logout Akun</span>
              </button>
            </div>

            {/* ─── TAB SELECTOR NAVIGATION ─── */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('chatai');
                  setDonationPayment(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'chatai'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <RiRobot2Fill className="text-base sm:text-lg" />
                <span>Tanya Chat AI Live</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-violet-950/80 text-violet-200 border border-violet-400/40">
                  Min. Rp 5.000
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('donation');
                  setDonationPayment(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'donation'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow-lg shadow-orange-500/30 font-black'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <RiCoinLine className="text-base sm:text-lg" />
                <span>Tip Alert VFX</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">
                  Min. Rp 5.000
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/30 font-black'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <RiChat1Line className="text-base sm:text-lg" />
                <span>Live Chat Bebas</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  Gratis
                </span>
              </button>
            </div>

            {/* ─── TAB CONTENT PANELS ─── */}
            <div className="space-y-6">
              {/* ═════════════════════════════════════════════════════════════════════════════ */}
              {/* ─── TAB 1: TANYA CHAT AI LIVE (MIN. RP 5.000) ────────────────────────────── */}
              {/* ═════════════════════════════════════════════════════════════════════════════ */}
              {activeTab === 'chatai' && (
                <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-violet-950/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-violet-950/30 space-y-6">
                  {/* Feature Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-600 p-0.5 shadow-lg shadow-violet-500/30 shrink-0">
                        <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                          <RiMagicFill className="text-violet-300 text-2xl" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-black text-white tracking-tight">
                            Tanya Chat AI Oracle di Live Stream
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full bg-violet-500/25 text-violet-300 border border-violet-400/40 text-[11px] font-mono font-black uppercase">
                            ✨ AI Voice TTS + Dialogue VFX
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                          Tanyakan apapun ke AI Oracle! Pertanyaanmu akan diproses oleh <strong>Pi AI & ZAI</strong>, lalu dibacakan dengan suara natural <strong>ElevenLabs TTS</strong> dan tampil di kotak dialog interaktif OBS Overlay streamer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-inner">
                        <RiVolumeUpLine className="text-violet-400 text-sm animate-pulse" />
                        <span>Syarat: Donasi Min. Rp 5.000</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSendAiDonation} className="space-y-6">
                    {/* 1. Prompt Textarea & Idea Chips */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="ai-prompt-input"
                          className="block text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider"
                        >
                          Pertanyaan / Prompt untuk AI Oracle <span className="text-violet-400">*</span>
                        </label>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {aiPrompt.length}/300 karakter
                        </span>
                      </div>

                      <textarea
                        id="ai-prompt-input"
                        rows={3}
                        required
                        maxLength={300}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ketik pertanyaan, roasting, tebak-tebakan, atau minta saran ke AI..."
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-violet-500/30 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all resize-none font-medium shadow-inner"
                      />

                      {/* Prompt Idea Chips */}
                      <div>
                        <span className="block text-[11px] font-semibold text-zinc-500 mb-1.5">
                          💡 Ide Pertanyaan Cepat (Klik untuk memilih):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {AI_PROMPT_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setAiPrompt(preset)}
                              className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 hover:text-violet-300 hover:border-violet-500/40 hover:bg-violet-950/30 transition-all text-left"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. Donation Amount (Min 5.000) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="ai-amount-input"
                          className="block text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider"
                        >
                          Nominal Donasi (Minimal Rp 5.000) <span className="text-violet-400">*</span>
                        </label>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          +{(aiAmount / 100).toLocaleString('id-ID')} Loyalty PTS
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[5000, 10000, 25000, 50000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setAiAmount(amt)}
                            className={`py-2.5 px-3 rounded-2xl border text-xs sm:text-sm font-mono font-black transition-all cursor-pointer ${
                              aiAmount === amt
                                ? 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-400/50 scale-[1.02]'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                            }`}
                          >
                            Rp {amt.toLocaleString('id-ID')}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-500">
                          Rp
                        </span>
                        <input
                          id="ai-amount-input"
                          type="number"
                          min={5000}
                          step={1000}
                          value={aiAmount}
                          onChange={(e) => setAiAmount(Math.max(5000, Number(e.target.value)))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || aiAmount < 5000 || !aiPrompt.trim()}
                        className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white font-black text-sm tracking-wide transition-all shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
                      >
                        <RiSparklingFill className="text-base text-yellow-300" />
                        <span>
                          {isSubmitting
                            ? 'Menyiapkan QRIS Chat AI...'
                            : `Bayar Rp ${aiAmount.toLocaleString('id-ID')} & Tanya AI (QRIS)`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSimulateAiDonation}
                        disabled={isSubmitting || aiAmount < 5000 || !aiPrompt.trim()}
                        title="Uji coba trigger interaksi Chat AI secara langsung tanpa transfer nyata"
                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                      >
                        <RiPlayFill className="text-sm text-cyan-400" />
                        <span>⚡ Simulasi Langsung (Test)</span>
                      </button>
                    </div>

                    {/* QRIS / Payment Status Feedback Container */}
                    {donationPayment && (
                      <div className="rounded-3xl border border-violet-500/40 bg-zinc-950/90 p-6 text-center shadow-2xl space-y-4">
                        {donationPayment.status === 'pending' && (
                          <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/40 text-xs font-mono font-bold">
                              <RiSparklingFill className="animate-spin text-violet-400" />
                              <span>QRIS Chat AI Aktif</span>
                            </div>

                            <p className="text-base font-black text-white">
                              Scan QRIS untuk Menyelesaikan Donasi & Mengirim Chat AI
                            </p>
                            <p className="text-xs text-zinc-400">
                              Total Bayar:{' '}
                              <strong className="text-emerald-400 text-sm font-mono">
                                Rp{' '}
                                {Number(
                                  donationPayment.totalPayment || donationPayment.amount
                                ).toLocaleString('id-ID')}
                              </strong>
                            </p>

                            {qrImageUrl ? (
                              <div className="mx-auto my-2 w-64 h-64 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center border-4 border-violet-500/40">
                                <img
                                  src={qrImageUrl}
                                  alt="QRIS Chat AI"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="py-10 text-xs text-zinc-500 font-mono">
                                Menyiapkan QR Code...
                              </div>
                            )}

                            <div className="flex items-center justify-center gap-4 text-xs">
                              <a
                                href={donationPayment.paymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
                              >
                                Buka Halaman Pembayaran Browser ↗
                              </a>
                            </div>

                            <p className="text-[11px] text-zinc-500 font-mono">
                              ⏳ Sistem otomatis memeriksa konfirmasi pembayaran QRIS setiap beberapa detik...
                            </p>
                          </>
                        )}

                        {donationPayment.status === 'completed' && (
                          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 font-black text-base">
                              <RiShieldCheckFill className="text-xl text-emerald-400" />
                              <span>Pembayaran Berhasil Diterima!</span>
                            </div>
                            <p className="text-xs text-emerald-200/90 leading-relaxed">
                              Pertanyaan Chat AI Anda sedang digenerate oleh AI dan ElevenLabs TTS. Interaksi audio akan segera tayang di live overlay streamer!
                            </p>
                          </div>
                        )}

                        {['canceled', 'expired', 'failed'].includes(donationPayment.status) && (
                          <p className="text-sm font-bold text-red-300">
                            Pembayaran {donationPayment.status}. Silakan buat transaksi baru.
                          </p>
                        )}
                      </div>
                    )}

                    {paymentError && (
                      <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-4 text-xs font-semibold text-red-300 flex items-start gap-2">
                        <RiInformationLine className="text-base text-red-400 shrink-0 mt-0.5" />
                        <span>{paymentError}</span>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════════════════════════════ */}
              {/* ─── TAB 2: STANDAR TIP ALERT VFX (MIN. RP 5.000) ─────────────────────────── */}
              {/* ═════════════════════════════════════════════════════════════════════════════ */}
              {activeTab === 'donation' && (
                <div className="rounded-3xl border border-orange-500/30 bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
                  {/* Feature Header */}
                  <div className="flex items-start gap-3.5 pb-6 border-b border-zinc-800">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                      <RiCoinLine className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">
                        Dukung Streamer (Tip Alert VFX)
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Kirim saweran / tip dukungan dengan alert visual spektakuler di layar live stream OBS.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendDonation} className="space-y-6">
                    <div>
                      <label
                        htmlFor="donor-amount"
                        className="block text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider mb-2"
                      >
                        Nominal Dukungan (Rp) - Minimal Rp 5.000
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {[5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDonorAmount(amt)}
                            className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                              donorAmount === amt
                                ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-sm ring-1 ring-orange-400/50 font-black'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {amt >= 1000000 ? `${amt / 1000000}jt` : amt >= 1000 ? `${amt / 1000}k` : amt}
                          </button>
                        ))}
                      </div>
                      <input
                        id="donor-amount"
                        type="number"
                        min={5000}
                        step={1000}
                        value={donorAmount}
                        onChange={(e) => setDonorAmount(Math.max(5000, Number(e.target.value)))}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-bold"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="donor-message"
                        className="block text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider mb-1.5"
                      >
                        Pesan Dukungan
                      </label>
                      <input
                        id="donor-message"
                        type="text"
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        placeholder="Tulis pesan penyemangat..."
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      />
                    </div>

                    {/* Choose Alert VFX Frame Variant */}
                    <div>
                      <span className="block text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider mb-2">
                        Pilih Efek Animasi Alert Layar
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate('electric-lightning')}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedTemplate === 'electric-lightning'
                              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-white">
                            <RiFlashlightFill className="text-cyan-400 text-base" />
                            <span>⚡ Electric VFX</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Sambaran petir fraktal dinamis
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTemplate('fire-glass')}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedTemplate === 'fire-glass'
                              ? 'bg-orange-950/60 border-orange-400 text-orange-300 ring-1 ring-orange-400/50'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-white">
                            <RiFireFill className="text-orange-400 text-base" />
                            <span>🔥 Inferno Flame</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Lidah api & bara melayang
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || donorAmount < 5000}
                        className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 disabled:pointer-events-none text-zinc-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RiHeart3Fill className="text-base text-red-950" />
                        <span>
                          {isSubmitting
                            ? 'Menyiapkan QRIS...'
                            : `Buat Pembayaran QRIS (Rp ${donorAmount.toLocaleString('id-ID')})`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSimulateDonation}
                        disabled={isSubmitting || donorAmount < 5000}
                        className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RiPlayFill className="text-sm text-orange-400" />
                        <span>⚡ Simulasi (Test)</span>
                      </button>
                    </div>

                    {donationPayment && (
                      <div className="rounded-3xl border border-orange-500/30 bg-zinc-950/80 p-6 text-center space-y-3">
                        {donationPayment.status === 'pending' && (
                          <>
                            <p className="text-base font-black text-white">
                              Scan QRIS untuk Membayar
                            </p>
                            <p className="text-xs text-zinc-400">
                              Total Bayar:{' '}
                              <strong className="text-orange-400 font-mono text-sm">
                                Rp{' '}
                                {Number(
                                  donationPayment.totalPayment || donationPayment.amount
                                ).toLocaleString('id-ID')}
                              </strong>
                            </p>
                            {qrImageUrl ? (
                              <div className="mx-auto my-2 w-64 h-64 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center border-4 border-orange-500/40">
                                <img
                                  src={qrImageUrl}
                                  alt="QRIS Donasi"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <p className="mt-4 text-xs text-zinc-500">Menyiapkan QR Code...</p>
                            )}
                            <a
                              href={donationPayment.paymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-xs font-bold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
                            >
                              Buka Halaman Pembayaran Browser ↗
                            </a>
                          </>
                        )}
                        {donationPayment.status === 'completed' && (
                          <p className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-300">
                            <RiShieldCheckFill className="text-lg" /> Pembayaran berhasil! Alert sedang ditampilkan di layar live stream.
                          </p>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════════════════════════════ */}
              {/* ─── TAB 3: LIVE CHAT BEBAS (GRATIS) ──────────────────────────────────────── */}
              {/* ═════════════════════════════════════════════════════════════════════════════ */}
              {activeTab === 'chat' && (
                <div className="rounded-3xl border border-cyan-500/30 bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex items-start gap-3.5 pb-6 border-b border-zinc-800">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <RiChat1Line className="text-2xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white tracking-tight">
                          Kirim Live Chat Gratis
                        </h2>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                          ● Live Connected
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Pesan obrolan bebas biaya yang langsung muncul di live chat OBS Overlay streamer.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendChat} className="space-y-4">
                    <div>
                      <label
                        htmlFor="chat-input"
                        className="block text-xs font-bold text-zinc-300 uppercase font-mono tracking-wider mb-1.5"
                      >
                        Pesan Chat Penonton
                      </label>
                      <textarea
                        id="chat-input"
                        rows={3}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ketik pesan Anda ke live streamer di sini..."
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RiSendPlane2Fill className="text-base" />
                      <span>Kirim ke Live Stream Chat</span>
                    </button>

                    {chatSentNotice && (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <RiShieldCheckFill className="text-base text-emerald-400 shrink-0" />
                        <span>Pesan Anda berhasil dikirim ke live overlay streamer!</span>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
