import { dashboardSocket } from '@core/ws/socketClient';
import { useState } from 'react';
import {
  RiBroadcastFill,
  RiCameraFill,
  RiChat1Line,
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiGamepadFill,
  RiGridFill,
  RiHeartFill,
  RiInformationLine,
  RiNotification3Fill,
  RiPlayFill,
  RiRefreshLine,
  RiSendPlane2Fill,
  RiShieldCheckFill,
  RiSparklingFill,
  RiStarFill,
  RiTvLine,
  RiVipCrownFill,
} from 'react-icons/ri';
import { dashboardService } from '../services/dashboardService';
import {
  DONATION_GIF_PRESETS,
  type AlertLayoutTemplate,
} from '../constants/overlayGifs';

type WidgetPreset = 'all' | 'alert' | 'chat' | 'ticker' | 'webcam';
type BackdropStyle = 'grid' | 'game' | 'dark';

export default function OverlayStudioPage() {
  const [activeWidget, setActiveWidget] = useState<WidgetPreset>('all');
  const [backdrop, setBackdrop] = useState<BackdropStyle>('game');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Donation Simulator State with GIF and Layout Template
  const [donorName, setDonorName] = useState('Sultan_Streaming');
  const [donationAmount, setDonationAmount] = useState('50000');
  const [donationCurrency] = useState('Rp');
  const [donationMessage, setDonationMessage] = useState('Semangat live stream-nya bang! GGWP 🔥☕');
  const [selectedGifId, setSelectedGifId] = useState<string>('cat_jam');
  const [customGifUrl, setCustomGifUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<AlertLayoutTemplate>('electric-lightning');
  const [alertSuccessToast, setAlertSuccessToast] = useState(false);

  // Chat Simulator State
  const [chatUser, setChatUser] = useState('Viewer_Pro');
  const [chatRole, setChatRole] = useState<'viewer' | 'owner' | 'moderator' | 'sponsor'>('viewer');
  const [chatMessage, setChatMessage] = useState('Halo bang! Gameplay-nya jago banget nih!');
  const [chatSuccessToast, setChatSuccessToast] = useState(false);

  // Base URL for OBS Browser Source
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const overlayUrl =
    activeWidget === 'all'
      ? `${origin}/overlay`
      : `${origin}/overlay?widget=${activeWidget}`;

  // Widget Resolution Recommendations
  const widgetSpecs = {
    all: { name: 'Full 1080p Master Overlay', w: 1920, h: 1080 },
    alert: { name: 'Donation Alert Box Only', w: 600, h: 320 },
    chat: { name: 'Live Stream Chat Box Only', w: 440, h: 560 },
    ticker: { name: 'Top Event Ticker & Goals Only', w: 1840, h: 70 },
    webcam: { name: '16:9 Webcam Frame Only', w: 460, h: 330 },
  };

  // Copy OBS URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Trigger Donation Alert via WebSocket
  const handleTriggerDonation = () => {
    const amountNum = Number(donationAmount) || 10000;
    const resolvedGifUrl =
      selectedGifId === 'custom'
        ? customGifUrl.trim()
        : DONATION_GIF_PRESETS.find((p) => p.id === selectedGifId)?.url;

    dashboardSocket.send('alert:test', {
      donorName: donorName.trim() || 'Anonymous Supporter',
      amount: amountNum,
      currency: donationCurrency,
      message: donationMessage.trim() || undefined,
      gifUrl: resolvedGifUrl || undefined,
      template: selectedTemplate,
    });

    setAlertSuccessToast(true);
    setTimeout(() => setAlertSuccessToast(false), 2000);
  };

  // Trigger Preset Donation
  const handlePresetDonation = (
    name: string,
    amount: number,
    msg: string,
    gifId: string,
    template: AlertLayoutTemplate
  ) => {
    setDonorName(name);
    setDonationAmount(amount.toString());
    setDonationMessage(msg);
    setSelectedGifId(gifId);
    setSelectedTemplate(template);

    const presetGif = DONATION_GIF_PRESETS.find((p) => p.id === gifId)?.url;

    dashboardSocket.send('alert:test', {
      donorName: name,
      amount,
      currency: 'Rp',
      message: msg,
      gifUrl: presetGif,
      template,
    });

    setAlertSuccessToast(true);
    setTimeout(() => setAlertSuccessToast(false), 2000);
  };

  // Trigger Live Chat Message via API & WebSocket
  const handleSendTestChat = async () => {
    if (!chatMessage.trim()) return;

    try {
      await dashboardService.sendTestChat({
        username: chatUser.trim() || 'Viewer',
        message: chatMessage.trim(),
        isModerator: chatRole === 'moderator',
        isSponsor: chatRole === 'sponsor',
      });

      setChatSuccessToast(true);
      setTimeout(() => setChatSuccessToast(false), 2000);
    } catch {
      // Fallback direct socket send
      dashboardSocket.send('chat:send', {
        user: chatUser.trim() || 'Viewer',
        message: chatMessage.trim(),
        role: chatRole,
      });
      setChatSuccessToast(true);
      setTimeout(() => setChatSuccessToast(false), 2000);
    }
  };

  // Stress Test: Send 5 Rapid Fire Chat Messages
  const handleRapidChatSpam = () => {
    const mockChats = [
      { user: 'Gamer_Santai', msg: 'Wih mulai rame nih!', role: 'viewer' as const },
      { user: 'Respati Host', msg: 'Selamat datang semuanya di live stream!', role: 'owner' as const },
      { user: 'Mod_Super', msg: 'Jangan lupa like dan share ya guys!', role: 'moderator' as const },
      { user: 'Member_Setia', msg: 'Emote hype spam 🔥🔥🔥', role: 'sponsor' as const },
      { user: 'Budi_Pro', msg: 'Lanjut terus bang jangan kasih kendor!', role: 'viewer' as const },
    ];

    mockChats.forEach((item, index) => {
      setTimeout(() => {
        dashboardSocket.send('chat:send', item);
      }, index * 400);
    });

    setChatSuccessToast(true);
    setTimeout(() => setChatSuccessToast(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
      {/* ─── HEADER & MASTER ACTION ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-zinc-950 text-white shadow-sm">
              <RiTvLine className="text-xl" />
            </div>
            <span>OBS Overlay Studio & Testing Lab</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Simulasi live preview untuk seluruh komponen overlay siaran, pengujian event real-time, dan URL Browser Source OBS
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href={overlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200 shadow-xs transition-all flex items-center gap-1.5"
          >
            <RiExternalLinkLine className="text-sm text-zinc-500" />
            <span>Buka di Tab Baru</span>
          </a>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-tactile transition-all flex items-center gap-1.5"
          >
            {copiedUrl ? (
              <>
                <RiCheckLine className="text-emerald-400 text-sm" />
                <span className="text-emerald-300">URL Tersalin!</span>
              </>
            ) : (
              <>
                <RiFileCopyLine className="text-sm" />
                <span>Salin URL OBS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── WIDGET PRESET TABS ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-zinc-200/70 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveWidget('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidget === 'all'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
            }`}
          >
            <RiBroadcastFill className="text-sm" />
            <span>Master 1080p Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveWidget('alert')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidget === 'alert'
                ? 'bg-amber-500 text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
            }`}
          >
            <RiNotification3Fill className="text-sm" />
            <span>Alert Box</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveWidget('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidget === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
            }`}
          >
            <RiChat1Line className="text-sm" />
            <span>Live Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveWidget('ticker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidget === 'ticker'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
            }`}
          >
            <RiHeartFill className="text-sm" />
            <span>Ticker & Sub Goal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveWidget('webcam')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeWidget === 'webcam'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
            }`}
          >
            <RiCameraFill className="text-sm" />
            <span>Cam Frame (16:9)</span>
          </button>
        </div>

        {/* Backdrop Switcher for Preview */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200 text-[11px] font-mono">
          <span className="text-zinc-400 px-1.5">Latar:</span>
          <button
            type="button"
            onClick={() => setBackdrop('game')}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 ${
              backdrop === 'game' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
            title="Simulasi Gameplay Game"
          >
            <RiGamepadFill className="text-xs" />
            <span>Game</span>
          </button>
          <button
            type="button"
            onClick={() => setBackdrop('grid')}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 ${
              backdrop === 'grid' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
            title="Latar Transparan / Alpha Checkerboard"
          >
            <RiGridFill className="text-xs" />
            <span>Transparan</span>
          </button>
          <button
            type="button"
            onClick={() => setBackdrop('dark')}
            className={`px-2 py-0.5 rounded-lg flex items-center gap-1 ${
              backdrop === 'dark' ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
            title="Latar Hitam Solid"
          >
            <span>Hitam</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN WORKSPACE (2-COLUMN GRID) ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ─── LEFT: LIVE SIMULATOR MONITOR (7 Cols) ───────────────────────── */}
        <div className="xl:col-span-7 space-y-4">
          <div className="studio-card bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Monitor Title Bar */}
            <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="font-bold text-zinc-200">
                  {widgetSpecs[activeWidget].name}
                </span>
                <span className="text-zinc-500">
                  ({widgetSpecs[activeWidget].w}x{widgetSpecs[activeWidget].h})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey((prev) => prev + 1)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Reload Overlay Iframe"
                >
                  <RiRefreshLine className="text-sm" />
                </button>
              </div>
            </div>

            {/* Scaled 16:9 Monitor Screen */}
            <div
              className={`relative w-full aspect-video overflow-hidden transition-all flex items-center justify-center ${
                backdrop === 'game'
                  ? 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900'
                  : backdrop === 'grid'
                    ? 'bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-900'
                    : 'bg-[#09090b]'
              }`}
            >
              {/* Gameplay Background Overlay Simulation */}
              {backdrop === 'game' && (
                <div className="absolute inset-0 pointer-events-none opacity-25">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_70%)]" />
                  <div className="absolute bottom-10 left-10 text-zinc-600 font-mono text-[10px]">
                    SIMULATED GAMEPLAY SCREEN (VALORANT / CYBERPUNK 2077)
                  </div>
                </div>
              )}

              {/* Live Iframe */}
              <iframe
                key={iframeKey}
                src={overlayUrl}
                title="Live Overlay Preview"
                className="w-full h-full border-0 pointer-events-auto bg-transparent"
                allow="autoplay"
              />
            </div>
          </div>

          {/* OBS Browser Source Setup Card */}
          <div className="studio-card bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiInformationLine className="text-blue-600 text-base" />
                <span className="text-xs font-bold text-zinc-900">
                  Panduan Pasang di OBS Studio Browser Source
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                OBS Preset: {widgetSpecs[activeWidget].w} x {widgetSpecs[activeWidget].h}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={overlayUrl}
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1"
              >
                {copiedUrl ? <RiCheckLine className="text-emerald-400" /> : <RiFileCopyLine />}
                <span>{copiedUrl ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              Di OBS Studio, tambahkan <strong>Sources ➡️ Browser</strong>, paste URL di atas, dan set Width:{' '}
              <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono font-bold text-zinc-800">
                {widgetSpecs[activeWidget].w}
              </code>{' '}
              & Height:{' '}
              <code className="bg-zinc-100 px-1 py-0.5 rounded font-mono font-bold text-zinc-800">
                {widgetSpecs[activeWidget].h}
              </code>
              . Centang opsi <em>"Shutdown source when not visible"</em>.
            </p>
          </div>
        </div>

        {/* ─── RIGHT: SIMULATION CONTROLS (5 Cols) ─────────────────────────── */}
        <div className="xl:col-span-5 space-y-6">
          {/* 🎁 1. DONATION & SUPERCHAT SIMULATOR */}
          <div className="studio-card bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  <RiNotification3Fill className="text-base" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wide">
                    Donation Alert Simulator
                  </h3>
                  <p className="text-[11px] text-zinc-400">Trigger alert donasi suara & visual di overlay</p>
                </div>
              </div>

              {alertSuccessToast && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
                  Alert Terkirim! 🔔
                </span>
              )}
            </div>

            {/* Preset Donation Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-500 font-bold uppercase">
                Quick Presets (1-Click Trigger):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePresetDonation(
                      'Budi_Santoso',
                      10000,
                      'Kopi buat streamer biar gak ngantuk ☕',
                      'pop_cat',
                      'side-badge'
                    )
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-all text-xs font-semibold text-zinc-800"
                >
                  <div className="text-[10px] text-zinc-400 font-mono">Small Tip</div>
                  <div className="font-bold text-amber-600">Rp 10.000</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">Pop Cat • Side</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePresetDonation(
                      'Andi_Kurnia',
                      50000,
                      'Semangat live malam ini bang! GGWP 🔥',
                      'cat_jam',
                      'top-banner'
                    )
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-all text-xs font-semibold text-zinc-800"
                >
                  <div className="text-[10px] text-zinc-400 font-mono">Medium Tip</div>
                  <div className="font-bold text-amber-600">Rp 50.000</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">Cat Jam • Top</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePresetDonation(
                      'Sultan_Gaming',
                      500000,
                      'Titip salam buat seluruh viewers! Gas terus sampai Immortal 🚀👑',
                      'gold_chest',
                      'epic-celebration'
                    )
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/80 text-left transition-all text-xs font-semibold text-zinc-900"
                >
                  <div className="text-[10px] text-amber-600 font-mono font-bold">Mega Whale 👑</div>
                  <div className="font-extrabold text-amber-700">Rp 500.000</div>
                  <div className="text-[9px] text-amber-600 font-mono mt-0.5">Gold Rain • Epic</div>
                </button>
              </div>
            </div>

            {/* Template Layout Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-zinc-500 font-bold uppercase">
                Pilih Layout Template Alert:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('electric-lightning')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedTemplate === 'electric-lightning'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-950 font-bold shadow-xs ring-1 ring-cyan-400'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-[10px] text-cyan-600 font-mono font-bold">⚡ Template 1 (Realtime)</div>
                  <div className="font-bold text-zinc-900 truncate">Electric Code VFX</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('fire-glass')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedTemplate === 'fire-glass'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-xs ring-1 ring-orange-400'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-[10px] text-orange-600 font-mono font-bold">🔥 Template 2 (Realtime)</div>
                  <div className="font-bold text-zinc-900 truncate">Inferno Flame VFX</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('top-banner')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedTemplate === 'top-banner'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-mono">Template 3</div>
                  <div className="truncate">Top Banner GIF</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('side-badge')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedTemplate === 'side-badge'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-mono">Template 4</div>
                  <div className="truncate">Side Badge GIF</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTemplate('epic-celebration')}
                  className={`px-2.5 py-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                    selectedTemplate === 'epic-celebration'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 font-mono">Template 5</div>
                  <div className="truncate">Mega Whale Epic</div>
                </button>
              </div>
            </div>

            {/* Animated GIF Presets Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono text-zinc-500 font-bold uppercase">
                Pilih Animasi GIF Sticker Alert:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DONATION_GIF_PRESETS.map((gif) => (
                  <button
                    key={gif.id}
                    type="button"
                    onClick={() => setSelectedGifId(gif.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedGifId === gif.id
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <img
                      src={gif.previewUrl}
                      alt={gif.name}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-[10px] font-bold text-zinc-800 text-center truncate w-full">
                      {gif.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom GIF URL input */}
              <div className="pt-2">
                <label className="text-[10px] font-mono text-zinc-400 block mb-1">
                  Atau gunakan Custom GIF URL (Giphy / Tenor / Direct GIF Link):
                </label>
                <input
                  type="text"
                  value={customGifUrl}
                  onChange={(e) => {
                    setCustomGifUrl(e.target.value);
                    if (e.target.value) setSelectedGifId('custom');
                  }}
                  placeholder="https://media.giphy.com/.../giphy.gif"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Input Form */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 block mb-1">Nama Donatur</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Nama Pengirim"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white font-sans focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-500 block mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white font-mono focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 block mb-1">Pesan Donasi (TTS)</label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  rows={2}
                  placeholder="Ketik pesan dukungan di sini..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white font-sans focus:ring-1 focus:ring-zinc-900 focus:outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleTriggerDonation}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs shadow-tactile transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <RiSparklingFill className="text-sm" />
                <span>Kirim Alert Donasi (Fire Alert)</span>
              </button>
            </div>
          </div>

          {/* 💬 2. LIVE CHAT SIMULATOR */}
          <div className="studio-card bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <RiChat1Line className="text-base" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wide">
                    Live Chat Stream Simulator
                  </h3>
                  <p className="text-[11px] text-zinc-400">Kirim pesan chat simulasi dengan berbagai role</p>
                </div>
              </div>

              {chatSuccessToast && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-fadeIn">
                  Chat Terkirim! 💬
                </span>
              )}
            </div>

            {/* Role Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-500 font-bold uppercase">Pilih Role User:</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setChatRole('viewer')}
                  className={`py-1.5 rounded-lg font-semibold border transition-all ${
                    chatRole === 'viewer'
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setChatRole('sponsor')}
                  className={`py-1.5 rounded-lg font-semibold border transition-all flex items-center justify-center gap-1 ${
                    chatRole === 'sponsor'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <RiStarFill className="text-xs" />
                  <span>Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatRole('moderator')}
                  className={`py-1.5 rounded-lg font-semibold border transition-all flex items-center justify-center gap-1 ${
                    chatRole === 'moderator'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <RiShieldCheckFill className="text-xs" />
                  <span>Mod</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChatRole('owner')}
                  className={`py-1.5 rounded-lg font-semibold border transition-all flex items-center justify-center gap-1 ${
                    chatRole === 'owner'
                      ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <RiVipCrownFill className="text-xs" />
                  <span>Host</span>
                </button>
              </div>
            </div>

            {/* Chat Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-500 block mb-1">Username Pengirim</label>
                <input
                  type="text"
                  value={chatUser}
                  onChange={(e) => setChatUser(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white font-sans focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-500 block mb-1">Isi Pesan Chat</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTestChat()}
                    placeholder="Ketik pesan chat..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white font-sans focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestChat}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <RiSendPlane2Fill className="text-xs" />
                    <span>Kirim</span>
                  </button>
                </div>
              </div>

              {/* Stress Test Spam Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRapidChatSpam}
                  className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs border border-zinc-300 transition-all flex items-center justify-center gap-2"
                >
                  <RiPlayFill className="text-sm text-zinc-600" />
                  <span>Stress Test: Spam 5 Pesan Otomatis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
