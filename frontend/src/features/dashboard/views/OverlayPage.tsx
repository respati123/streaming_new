import { overlaySocket } from '@core/ws/socketClient';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RiCameraFill,
  RiChat1Line,
  RiCloseLine,
  RiFlashlightFill,
  RiRefreshLine,
  RiShieldCheckFill,
  RiSparklingFill,
  RiStarFill,
  RiVipCrownFill,
  RiVolumeUpLine,
} from 'react-icons/ri';
import { dashboardService } from '../services/dashboardService';
import type { OverlaySummary } from '../types/dashboard.types';
import { useSearchParams } from 'react-router-dom';
import {
  DONATION_GIF_PRESETS,
  type AlertLayoutTemplate,
} from '../constants/overlayGifs';
import { ElectricLightningFrame } from '../components/ElectricLightningFrame';
import { FireFlameFrame } from '../components/FireFlameFrame';

interface ChatOverlayMsg {
  id: string;
  username: string;
  youtubeHandle?: string | null;
  message: string;
  avatarUrl?: string | null;
  isOwner?: boolean;
  isModerator?: boolean;
  isSponsor?: boolean;
  isVerified?: boolean;
  tier?: string;
  timestamp: string;
}

interface AlertToast {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  message?: string;
  gifUrl?: string | null;
  template?: AlertLayoutTemplate;
  durationMs: number;
}

/**
 * Synthesize a melodic chime using native Web Audio API (Zero external MP3 dependencies)
 */
function playChimeAlert() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6 (Major chord chime)

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.001, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.3, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.65);
    });
  } catch {
    // Audio autoplay restrictions in some browsers
  }
}

export default function OverlayPage() {
  const [searchParams] = useSearchParams();
  const widgetFilter = searchParams.get('widget') || 'all'; // 'all' | 'alert' | 'chat' | 'ticker' | 'webcam'
  const [messages, setMessages] = useState<ChatOverlayMsg[]>([]);
  const [activeAlert, setActiveAlert] = useState<AlertToast | null>(null);
  const [showWebcamFrame, setShowWebcamFrame] = useState(true);
  const [showPreviewTools, setShowPreviewTools] = useState(false);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Dynamic Overlay Summary (Settings, Active Stream, Goals, Top Tips)
  const { data: summary, refetch: refetchSummary } = useQuery<OverlaySummary>({
    queryKey: ['overlay-summary'],
    queryFn: () => dashboardService.getOverlaySummary(),
    staleTime: 30000,
  });

  // 2. Trigger Alert Helper
  const triggerAlert = useCallback((alert: Omit<AlertToast, 'id'>) => {
    const alertId = Date.now().toString();
    playChimeAlert();

    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }

    // Determine fallback GIF & template based on tier if not specified
    let selectedGif = alert.gifUrl;
    let selectedTemplate = alert.template;

    if (!selectedGif) {
      if (alert.amount >= 500000) {
        selectedGif = DONATION_GIF_PRESETS[2].url; // Gold rain
        selectedTemplate = selectedTemplate || 'fire-glass';
      } else if (alert.amount >= 50000) {
        selectedGif = DONATION_GIF_PRESETS[0].url; // Cat jam
        selectedTemplate = selectedTemplate || 'fire-glass';
      } else {
        selectedGif = DONATION_GIF_PRESETS[1].url; // Pop cat
        selectedTemplate = selectedTemplate || 'fire-glass';
      }
    }

    setActiveAlert({
      ...alert,
      gifUrl: selectedGif,
      template: selectedTemplate || 'fire-glass',
      id: alertId,
    });

    alertTimerRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, alert.durationMs || 8000);
  }, []);

  // 3. Real-time WebSocket Listeners
  useEffect(() => {
    overlaySocket.connect();

    const unsubChat = overlaySocket.on('chat:message', (payload: any) => {
      if (!payload) return;
      const newMsg: ChatOverlayMsg = {
        id: payload.id || Date.now().toString(),
        username: payload.user || payload.username || 'Anonymous',
        youtubeHandle: payload.youtubeHandle || null,
        message: payload.message || '',
        avatarUrl: payload.avatarUrl || payload.userAvatarUrl || null,
        isOwner: payload.isOwner || payload.role === 'streamer' || payload.role === 'owner',
        isModerator: payload.isModerator || payload.role === 'moderator',
        isSponsor: payload.isSponsor || payload.role === 'member' || payload.role === 'sponsor',
        isVerified: payload.isVerified || false,
        tier: payload.tier || 'bronze',
        timestamp: payload.timestamp || payload.publishedAt || new Date().toISOString(),
      };

      setMessages((prev) => [...prev.slice(-12), newMsg]);
    });

    const unsubAlert = overlaySocket.on('donation:alert', (payload: any) => {
      if (!payload) return;
      triggerAlert({
        donorName: payload.donorName || 'Generous Supporter',
        amount: Number(payload.amount) || 10000,
        currency: payload.currency || 'Rp',
        message: payload.message || undefined,
        gifUrl: payload.gifUrl || undefined,
        template: payload.template || undefined,
        durationMs: payload.durationMs || 8000,
      });
      // Refresh summary to update ticker metrics
      refetchSummary();
    });

    return () => {
      unsubChat();
      unsubAlert();
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [triggerAlert, refetchSummary]);

  const streamerHandle = summary?.settings?.streamerHandle || '@respati_stream';

  return (
    <div className="w-full h-full min-h-screen overflow-hidden bg-transparent relative font-sans select-none pointer-events-none">
      {/* ─── 02. ACTIVE DONATION ALERT TOAST (Animated GIF / MP4 Template Wrapper) ─── */}
      {(widgetFilter === 'all' || widgetFilter === 'alert') && activeAlert && (
        <div className="absolute left-1/2 -translate-x-1/2 top-8 w-full max-w-[760px] z-50 animate-in zoom-in-95 duration-200 pointer-events-auto">
            {/* ⚡ 0. PROCEDURAL REALTIME ELECTRIC LIGHTNING CANVAS FRAME (100% Flexible & Dynamic) */}
            {activeAlert.template === 'electric-lightning' && (
              <ElectricLightningFrame
                className="w-full max-w-[660px] mx-auto rounded-3xl bg-zinc-950/90 backdrop-blur-xl p-5 shadow-[0_0_50px_rgba(0,240,255,0.25)] border border-cyan-500/30 text-white select-none animate-in zoom-in-95 duration-200"
                glowColor="#00f0ff"
                coreColor="#ffffff"
                intensity={1.1}
                borderRadius={24}
                enableSparks={true}
              >
                <div className="flex flex-col justify-between space-y-4 text-white p-2">
                  {/* Top Notch: Electric Badge & Channel Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] backdrop-blur-md">
                      <RiFlashlightFill className="text-cyan-400 text-sm animate-bounce" />
                      <span className="tracking-wider uppercase">
                        {summary?.settings?.streamerName
                          ? `${summary.settings.streamerName.toUpperCase()}`
                          : 'LIVE DONATION'}
                      </span>
                    </div>

                    <div className="px-3 py-0.5 rounded-full bg-blue-950/90 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono font-bold backdrop-blur-sm animate-pulse">
                      ⚡ REALTIME VFX
                    </div>
                  </div>

                  {/* Center Hero: Glowing Electric Cyan / Ice Blue Amount & White Donor Name */}
                  <div className="text-center py-1">
                    <div className="font-black text-4xl sm:text-5xl font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_30px_rgba(0,240,255,0.9)] select-text">
                      {activeAlert.currency === 'SUB'
                        ? 'NEW SUBSCRIBER! 🔔'
                        : activeAlert.currency === '$' || activeAlert.currency === 'USD'
                        ? `$${activeAlert.amount.toFixed(2)}`
                        : `${activeAlert.currency} ${activeAlert.amount.toLocaleString('id-ID')}`}
                    </div>
                    <div className="text-white font-black text-2xl sm:text-3xl uppercase tracking-wider mt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] truncate px-4">
                      {activeAlert.donorName}
                    </div>
                  </div>

                  {/* Bottom Donor Message Capsule (Automatically Expands Vertically without Breaking Border!) */}
                  {activeAlert.message && (
                    <div>
                      <div className="bg-cyan-950/40 border border-cyan-400/40 rounded-2xl py-2.5 px-5 text-center text-sm font-semibold text-cyan-100 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] leading-relaxed break-words">
                        "{activeAlert.message}"
                      </div>
                    </div>
                  )}
                </div>
              </ElectricLightningFrame>
            )}

            {/* 🔥 1. PROCEDURAL REALTIME INFERNO FLAME CANVAS FRAME (100% Flexible & Dynamic) */}
            {activeAlert.template === 'fire-glass' && (
              <FireFlameFrame
                className="w-full max-w-[660px] mx-auto rounded-3xl bg-zinc-950/90 backdrop-blur-xl p-5 shadow-[0_0_50px_rgba(255,69,0,0.3)] border border-orange-500/30 text-white select-none animate-in zoom-in-95 duration-200"
                primaryColor="#ff4500"
                secondaryColor="#ffb700"
                coreColor="#fff7cc"
                intensity={1.15}
                borderRadius={24}
                enableEmbers={true}
              >
                <div className="flex flex-col justify-between space-y-4 text-white p-2">
                  {/* Top Notch: Fire Badge & Channel Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/90 border border-orange-500/60 text-amber-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(255,100,0,0.4)] backdrop-blur-md">
                      <RiSparklingFill className="text-amber-400 text-sm animate-spin" />
                      <span className="tracking-wider uppercase">
                        {activeAlert.currency === 'SUB'
                          ? 'NEW SUBSCRIBER'
                          : summary?.settings?.streamerName
                          ? `${summary.settings.streamerName.toUpperCase()}`
                          : 'LIVE DONATION'}
                      </span>
                    </div>

                    <div className="px-3 py-0.5 rounded-full bg-red-950/90 border border-orange-400/50 text-amber-300 text-[10px] font-mono font-bold backdrop-blur-sm animate-pulse flex items-center gap-1">
                      <span>🔥 INFERNO VFX</span>
                    </div>
                  </div>

                  {/* Center Hero: 3D Metallic Golden Amount & Donor Name */}
                  <div className="text-center py-1">
                    <div className="golden-3d-text font-black text-4xl sm:text-5xl font-mono tracking-tight select-text">
                      {activeAlert.currency === 'SUB'
                        ? 'NEW SUBSCRIBER! 🔔'
                        : activeAlert.currency === '$' || activeAlert.currency === 'USD'
                        ? `$${activeAlert.amount.toFixed(2)}`
                        : `${activeAlert.currency} ${activeAlert.amount.toLocaleString('id-ID')}`}
                    </div>
                    <div className="text-white font-black text-2xl sm:text-3xl uppercase tracking-wider mt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] truncate px-4">
                      {activeAlert.donorName}
                    </div>
                  </div>

                  {/* Bottom Donor Message Capsule (Automatically Expands Vertically without Breaking Border!) */}
                  {activeAlert.message && (
                    <div>
                      <div className="bg-orange-950/40 border border-orange-500/40 rounded-2xl py-2.5 px-5 text-center text-sm font-semibold text-amber-100 backdrop-blur-md shadow-[0_0_20px_rgba(255,69,0,0.15)] leading-relaxed break-words">
                        "{activeAlert.message}"
                      </div>
                    </div>
                  )}
                </div>
              </FireFlameFrame>
            )}

            {/* 1. TOP BANNER TEMPLATE */}
            {activeAlert.template === 'top-banner' && (
              <div className="flex flex-col items-center">
                {/* Floating Animated GIF Sticker on Top */}
                {activeAlert.gifUrl && (
                  <div className="relative -mb-6 z-10 animate-bounce duration-1000">
                    <img
                      src={activeAlert.gifUrl}
                      alt="Donation Sticker GIF"
                      className="h-36 max-w-[240px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] filter"
                    />
                  </div>
                )}

                {/* Glassmorphic Box Wrapper */}
                <div className="w-full bg-zinc-950/95 border-2 border-amber-400/90 rounded-3xl p-6 pt-8 shadow-[0_0_50px_rgba(251,191,36,0.35)] backdrop-blur-xl text-white text-center relative overflow-hidden">
                  {/* Glowing header badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-mono font-extrabold text-amber-400 uppercase tracking-widest mb-2 shadow-inner">
                    <RiSparklingFill className="text-amber-400 text-xs" />
                    <span>DONATION RECEIVED!</span>
                  </div>

                  {/* Donor Name & Amount */}
                  <h2 className="text-2xl font-black text-white tracking-tight truncate">
                    {activeAlert.donorName}
                  </h2>
                  <div className="text-3xl font-black text-amber-300 font-mono tracking-tight mt-1">
                    {activeAlert.currency} {activeAlert.amount.toLocaleString('id-ID')}
                  </div>

                  {/* Donor Message / TTS */}
                  {activeAlert.message && (
                    <div className="mt-4 text-sm text-zinc-100 bg-zinc-900/90 p-4 rounded-2xl border border-white/10 font-sans leading-relaxed break-words shadow-inner text-left">
                      "{activeAlert.message}"
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 animate-pulse w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SIDE BADGE TEMPLATE */}
            {activeAlert.template === 'side-badge' && (
              <div className="w-full bg-zinc-950/95 border-2 border-amber-400/90 rounded-3xl p-5 shadow-[0_0_50px_rgba(251,191,36,0.35)] backdrop-blur-xl text-white flex items-center gap-5 relative overflow-hidden">
                {/* Left GIF Badge */}
                {activeAlert.gifUrl && (
                  <div className="w-28 h-28 shrink-0 flex items-center justify-center bg-zinc-900/80 rounded-2xl border border-amber-400/40 p-1 shadow-inner">
                    <img
                      src={activeAlert.gifUrl}
                      alt="Donation GIF"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Right Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase font-mono font-extrabold text-amber-400 tracking-widest flex items-center gap-1.5">
                    <RiSparklingFill className="text-amber-400 text-xs" />
                    <span>DONATION RECEIVED!</span>
                  </div>
                  <div className="text-xl font-black text-white mt-0.5 truncate">
                    {activeAlert.donorName}
                  </div>
                  <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                    {activeAlert.currency} {activeAlert.amount.toLocaleString('id-ID')}
                  </div>

                  {activeAlert.message && (
                    <div className="mt-2 text-xs text-zinc-200 bg-zinc-900/80 p-2.5 rounded-xl border border-white/10 font-sans leading-relaxed break-words">
                      "{activeAlert.message}"
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-amber-400 animate-pulse w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. EPIC CELEBRATION TEMPLATE */}
            {activeAlert.template === 'epic-celebration' && (
              <div className="w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-3 border-amber-400 rounded-3xl p-6 shadow-[0_0_70px_rgba(251,191,36,0.6)] backdrop-blur-2xl text-white text-center relative overflow-hidden ring-4 ring-amber-500/20">
                {/* Floating GIF */}
                {activeAlert.gifUrl && (
                  <div className="mb-2 flex justify-center">
                    <img
                      src={activeAlert.gifUrl}
                      alt="Donation GIF"
                      className="h-36 max-w-[280px] object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                    />
                  </div>
                )}

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/30 border border-amber-300 text-xs font-mono font-black text-amber-300 uppercase tracking-widest mb-2 shadow-lg animate-pulse">
                  <RiVipCrownFill className="text-amber-400 text-sm" />
                  <span>👑 MEGA WHALE DONATION! 👑</span>
                </div>

                <h2 className="text-3xl font-black text-white tracking-tight truncate drop-shadow-md">
                  {activeAlert.donorName}
                </h2>
                <div className="text-4xl font-black text-amber-300 font-mono tracking-tight mt-1 drop-shadow-[0_2px_10px_rgba(251,191,36,0.8)]">
                  {activeAlert.currency} {activeAlert.amount.toLocaleString('id-ID')}
                </div>

                {activeAlert.message && (
                  <div className="mt-4 text-sm font-medium text-zinc-100 bg-zinc-900/90 p-4 rounded-2xl border border-amber-400/30 font-sans leading-relaxed break-words shadow-inner text-left">
                    "{activeAlert.message}"
                  </div>
                )}

                {/* Progress Bar */}
                <div className="w-full h-2 bg-zinc-800 rounded-full mt-5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 animate-pulse w-full" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── 03. LIVE CHAT OVERLAY BOX ───────────────────────────────────────── */}
        {(widgetFilter === 'all' || widgetFilter === 'chat') && (
          <div className="absolute left-0 bottom-0 w-[300px] h-[380px] bg-transparent pl-3 pb-2 flex flex-col justify-end pointer-events-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 px-1">
              <div className="flex items-center gap-1.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <RiChat1Line className="text-blue-400 text-sm" />
                <span className="text-[11px] font-extrabold uppercase font-mono tracking-wider">
                  Live Chat
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-1.5 py-1">
              {messages.length === 0 ? (
                <div className="py-6 text-left text-zinc-400 font-mono text-[11px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] px-1">
                  <span>Waiting for messages...</span>
                </div>
              ) : (
                messages.slice(-6).map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-black/55 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-md shadow-lg pointer-events-auto flex items-start gap-2"
                  >
                    {/* Viewer Avatar (Google Profile Picture if logged in) */}
                    {msg.avatarUrl ? (
                      <img
                        src={msg.avatarUrl}
                        alt={msg.username}
                        className="w-5 h-5 rounded-full object-cover border border-cyan-400/60 shrink-0 mt-0.5 shadow-sm"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold text-zinc-300">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <div className="flex items-center gap-1 flex-wrap min-w-0">
                          {msg.isOwner && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono flex items-center gap-0.5">
                              <RiVipCrownFill className="text-[9px]" /> HOST
                            </span>
                          )}
                          {msg.isModerator && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono flex items-center gap-0.5">
                              <RiShieldCheckFill className="text-[9px]" /> MOD
                            </span>
                          )}
                          {msg.isSponsor && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-0.5">
                              <RiStarFill className="text-[9px]" /> MEMBER
                            </span>
                          )}
                          {msg.tier && msg.tier !== 'bronze' && !msg.isOwner && (
                            <span className={`px-1 py-0.2 rounded text-[8px] font-bold uppercase font-mono flex items-center gap-0.5 ${
                              msg.tier === 'diamond'
                                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/80 shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                                : msg.tier === 'gold'
                                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/80'
                                : 'bg-zinc-400/30 text-zinc-200 border border-zinc-400/80'
                            }`}>
                              <RiSparklingFill className="text-[8px]" /> {msg.tier}
                            </span>
                          )}
                          {msg.isVerified && !msg.isOwner && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono flex items-center gap-0.5">
                              <RiShieldCheckFill className="text-[9px]" /> GOOGLE
                            </span>
                          )}
                          <span className="font-extrabold font-sans text-white truncate text-[11px]">
                            {msg.username}
                          </span>
                        </div>

                        <span className="text-[8px] font-mono text-zinc-400 shrink-0">
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-zinc-100 text-[11px] leading-snug font-sans break-words select-text">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── 04. 16:9 WEBCAM FRAME BORDER ────────────────────────────────────── */}
        {(widgetFilter === 'all' || widgetFilter === 'webcam') && showWebcamFrame && (
          <div className="absolute right-3 bottom-3 w-[280px] h-[190px] border-2 border-white/20 bg-transparent rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-2.5 pointer-events-none">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600/90 text-[9px] font-mono font-extrabold shadow-sm tracking-wider">
                <RiCameraFill className="text-[10px]" /> CAM 1 • LIVE
              </div>
              <span className="text-[9px] font-mono text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">1080p 60fps</span>
            </div>

            {/* Webcam Footer Handle */}
            <div className="bg-black/40 rounded-lg px-2.5 py-1 flex items-center justify-between text-white border border-white/10 backdrop-blur-xs">
              <span className="text-[11px] font-bold font-mono text-zinc-100">{streamerHandle}</span>
              <span className="text-[9px] font-mono text-zinc-300">
                {summary?.settings?.youtubeChannelUrl || 'youtube.com'}
              </span>
            </div>
          </div>
        )}

      {/* ─── 05. DISCREET PREVIEW / TEST CONTROLS TOOLBAR ──────────────────── */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {showPreviewTools && (
          <div className="bg-zinc-950/90 border border-white/20 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex items-center gap-2 text-xs text-white animate-in slide-in-from-right-4 duration-150">
            {/* Test Alert */}
            <button
              type="button"
              onClick={() =>
                triggerAlert({
                  donorName: 'Andi_Kurnia',
                  amount: 50000,
                  currency: 'Rp',
                  message: 'Semangat terus bang! Ini kopi buat nemenin live malam ini ☕🔥',
                  durationMs: 8000,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <RiSparklingFill className="text-sm" />
              <span>Test Donation</span>
            </button>

            {/* Test Chat */}
            <button
              type="button"
              onClick={() =>
                setMessages((prev) => [
                  ...prev.slice(-12),
                  {
                    id: Date.now().toString(),
                    username: 'Viewer_Baru',
                    message: 'Halo bang! Overlay-nya keren banget nih! GG 🔥',
                    isSponsor: true,
                    timestamp: new Date().toISOString(),
                  },
                ])
              }
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <RiChat1Line className="text-sm" />
              <span>Test Chat</span>
            </button>

            {/* Test Audio Chime */}
            <button
              type="button"
              onClick={playChimeAlert}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all"
              title="Test Chime Sound"
            >
              <RiVolumeUpLine className="text-base" />
            </button>

            {/* Toggle Webcam */}
            <button
              type="button"
              onClick={() => setShowWebcamFrame((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-semibold border transition-all ${
                showWebcamFrame
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              Cam: {showWebcamFrame ? 'ON' : 'OFF'}
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetchSummary()}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all"
              title="Refresh Data"
            >
              <RiRefreshLine className="text-base" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPreviewTools((prev) => !prev)}
          className="p-2.5 rounded-2xl bg-zinc-950/80 border border-white/20 text-white hover:bg-zinc-900 shadow-xl transition-all active:scale-95 backdrop-blur-md"
          title="Toggle Overlay Preview Toolbar"
        >
          {showPreviewTools ? <RiCloseLine className="text-lg" /> : <RiFlashlightFill className="text-amber-400 text-lg" />}
        </button>
      </div>
    </div>
  );
}
