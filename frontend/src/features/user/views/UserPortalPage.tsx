import { signIn, signOut, useSession } from '@core/auth/authClient';
import { overlaySocket } from '@core/ws/socketClient';
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
  RiSendPlane2Fill,
  RiShieldCheckFill,
  RiSparklingFill,
  RiUser3Fill,
  RiVipCrownFill,
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

export default function UserPortalPage() {
  const { data: session, isPending } = useSession();
  const [chatInput, setChatInput] = useState('');
  const [chatSentNotice, setChatSentNotice] = useState(false);

  // Donation Form States
  const [donorAmount, setDonorAmount] = useState(25000);
  const [donorMessage, setDonorMessage] = useState('Semangat live-nya bang! GGWP 🔥⚡');
  const [selectedTemplate, setSelectedTemplate] = useState<'electric-lightning' | 'fire-glass'>(
    'electric-lightning'
  );
  const [donationPayment, setDonationPayment] = useState<DonationPaymentStatus | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const viewerProfile = session?.user as ViewerProfile | undefined;
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

  // Handle Sending Chat to Live Stream Overlay
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userObj = viewerProfile;
    const displayName = userObj?.youtubeHandle || userObj?.name || 'Google Viewer';
    const avatarUrl = userObj?.image || null;

    overlaySocket.send('chat:send', {
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
      color: { dark: '#18181b', light: '#ffffff' },
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

  // Create a real QRIS transaction; the donation alert is emitted after payment confirmation.
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
        amount: donorAmount,
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[400px] bg-orange-600/10 blur-[140px] rounded-full" />
      </div>

      {/* ─── NAVIGATION BAR ─── */}
      <header className="relative z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <RiSparklingFill className="text-cyan-400 text-xl animate-pulse" />
              </div>
            </div>
            <div>
              <div className="font-black text-base tracking-tight flex items-center gap-2">
                <span>VIEWER HUB</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  BETTER AUTH
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Panel Interaksi Penonton & Google Login
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <RiDashboardFill className="text-sm" />
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
            <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-zinc-400 font-mono">Memeriksa sesi Google Better Auth...</p>
          </div>
        )}

        {/* ─── SECTION A: NOT LOGGED IN (GOOGLE AUTH PROMPT) ─── */}
        {!isPending && !session && (
          <div className="max-w-md mx-auto py-12">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl p-8 shadow-2xl shadow-black/80 text-center relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                <RiUser3Fill className="text-3xl text-cyan-400" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Login Penonton</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Masuk menggunakan akun <strong>Google</strong> melalui <strong>Better Auth</strong>{' '}
                untuk berinteraksi di live stream dengan nama dan foto profil asli Anda.
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
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-cyan-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Google Avatar */}
                <div className="relative">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-black text-2xl">
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
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold flex items-center gap-1">
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

                  <div className="flex items-center gap-4 mt-2 text-xs font-mono">
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

            {/* Grid Tools: Live Chat & Donation Interactive Trigger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ─── TOOL 1: LIVE CHAT TRANSMITTER ─── */}
              <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <RiChat1Line className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">Kirim Live Chat</h3>
                        <p className="text-xs text-zinc-400">
                          Pesan langsung muncul di OBS Overlay
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ● Live Connected
                    </span>
                  </div>

                  <form onSubmit={handleSendChat} className="space-y-4">
                    <div>
                      <label
                        htmlFor="chat-input"
                        className="block text-xs font-semibold text-zinc-400 mb-1.5"
                      >
                        Pesan Chat Penonton
                      </label>
                      id="chat-input"
                      <textarea
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
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RiSendPlane2Fill className="text-base" />
                      <span>Kirim ke Live Stream</span>
                    </button>

                    {chatSentNotice && (
                      <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <RiShieldCheckFill className="text-base text-emerald-400 shrink-0" />
                        <span>Pesan Anda berhasil dikirim ke live overlay streamer!</span>
                      </div>
                    )}
                  </form>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 text-xs text-zinc-500 flex items-center gap-2">
                  <RiInformationLine className="text-sm shrink-0" />
                  <span>Pesan dikirim menggunakan identitas Google terverifikasi Anda.</span>
                </div>
              </div>

              {/* ─── TOOL 2: INTERACTIVE DONATION / SUPPORT ─── */}
              <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                        <RiCoinLine className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white">
                          Dukung Streamer (Tip Alert)
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Trigger alert VFX di layar live stream
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      ⚡ Realtime VFX
                    </span>
                  </div>

                  <form onSubmit={handleSendDonation} className="space-y-4">
                    <div>
                      <label
                        htmlFor="donor-amount"
                        className="block text-xs font-semibold text-zinc-400 mb-1.5"
                      >
                        Nominal Dukungan (Rp)
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {[10000, 25000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDonorAmount(amt)}
                            className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                              donorAmount === amt
                                ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-sm ring-1 ring-orange-400/50'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {amt >= 1000 ? `${amt / 1000}k` : amt}
                          </button>
                        ))}
                      </div>
                      <input
                        id="donor-amount"
                        type="number"
                        value={donorAmount}
                        onChange={(e) => setDonorAmount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="donor-message"
                        className="block text-xs font-semibold text-zinc-400 mb-1.5"
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
                      <span className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        Pilih Efek Animasi Alert Layar
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate('electric-lightning')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedTemplate === 'electric-lightning'
                              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            <RiFlashlightFill className="text-cyan-400" />
                            <span>⚡ Electric VFX</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Sambaran petir fraktal dinamis
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedTemplate('fire-glass')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedTemplate === 'fire-glass'
                              ? 'bg-orange-950/60 border-orange-400 text-orange-300 ring-1 ring-orange-400/50'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                            <RiFireFill className="text-orange-400" />
                            <span>🔥 Inferno Flame</span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Lidah api & bara melayang
                          </p>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || donationPayment?.status === 'pending'}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 disabled:pointer-events-none text-zinc-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RiHeart3Fill className="text-base text-red-950" />
                      <span>{isSubmitting ? 'Menyiapkan QRIS...' : 'Buat Pembayaran QRIS'}</span>
                    </button>

                    {donationPayment && (
                      <div className="rounded-2xl border border-orange-500/30 bg-zinc-950/80 p-4 text-center">
                        {donationPayment.status === 'pending' && (
                          <>
                            <p className="text-sm font-bold text-orange-200">
                              Scan QRIS untuk membayar
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              Total bayar: Rp{' '}
                              {Number(
                                donationPayment.totalPayment || donationPayment.amount
                              ).toLocaleString('id-ID')}
                            </p>
                            {qrImageUrl ? (
                              <img
                                src={qrImageUrl}
                                alt="QRIS pembayaran donasi"
                                className="mx-auto mt-3 h-56 w-56 rounded-xl bg-white p-2"
                              />
                            ) : (
                              <p className="mt-4 text-xs text-zinc-500">Menyiapkan QR code...</p>
                            )}
                            <a
                              href={donationPayment.paymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 inline-flex text-xs font-bold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
                            >
                              Buka halaman pembayaran
                            </a>
                            <p className="mt-3 text-[11px] text-zinc-500">
                              Halaman ini otomatis mengecek pembayaran setiap beberapa detik.
                            </p>
                          </>
                        )}
                        {donationPayment.status === 'completed' && (
                          <p className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-300">
                            <RiShieldCheckFill /> Pembayaran berhasil, alert sedang ditampilkan.
                          </p>
                        )}
                        {['canceled', 'expired', 'failed'].includes(donationPayment.status) && (
                          <p className="text-sm font-bold text-red-300">
                            Pembayaran {donationPayment.status}. Silakan buat transaksi baru.
                          </p>
                        )}
                      </div>
                    )}

                    {paymentError && (
                      <div className="rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs font-semibold text-red-300">
                        {paymentError}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
