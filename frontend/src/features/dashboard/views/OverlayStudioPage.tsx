import {
  Check,
  Copy,
  FlaskConical,
  Gift,
  MessageSquare,
  Send,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { DonationConfigModal } from '../components/DonationConfigModal';
import { EventTracePanel } from '../components/EventTracePanel';
import { ObsVirtualCanvas } from '../components/ObsVirtualCanvas';
import { useOverlayLabViewModel } from '../viewmodels/useOverlayLabViewModel';

export default function OverlayStudioPage() {
  const { states, handlers } = useOverlayLabViewModel();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1720px] w-full mx-auto space-y-6 font-sans text-[#18181B]">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/50 text-zinc-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Testing Overlay Lab Suite
              </h1>
              <p className="text-xs text-[#52525B] font-mono">
                Simulator payload interaktif untuk OBS Browser Source Overlay & Streamer.bot Webhook
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F4F4F5] border border-[#D4D4D8] text-xs font-mono text-zinc-300">
            <span className="text-[#52525B]">OBS URL:</span>
            <span className="text-zinc-400 font-bold">/overlay</span>
            <button
              type="button"
              onClick={handlers.handleCopyObsUrl}
              className="ml-1 p-1 rounded hover:bg-[#D4D4D8] text-[#52525B] hover:text-white transition-colors"
              title="Salin OBS Browser Source URL"
            >
              {states.copiedUrl ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>OBS Stage Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#D4D4D8] flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlers.handleTabSelect('chat')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                states.activeTab === 'chat'
                  ? 'bg-zinc-600 text-white shadow-md shadow-zinc-950/50'
                  : 'text-[#52525B] hover:text-white hover:bg-[#F4F4F5]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tab 1: Chat Overlay Test</span>
            </button>

            <button
              type="button"
              onClick={() => handlers.handleTabSelect('donation')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                states.activeTab === 'donation'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                  : 'text-[#52525B] hover:text-white hover:bg-[#F4F4F5]'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Tab 2: Donation Alert Test</span>
            </button>
          </div>

          {states.activeTab === 'chat' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-sm font-bold text-white">Single Chat Dispatcher</h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#52525B]">
                    Case 01 & 02: Single Chat
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="chat-user-input"
                        className="block text-[11px] font-mono text-[#52525B] mb-1"
                      >
                        Username Penonton
                      </label>
                      <input
                        id="chat-user-input"
                        type="text"
                        value={states.chatUsername}
                        onChange={(e) => handlers.handleChatUsernameChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg text-white font-mono focus:outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="role-viewer-btn"
                        className="block text-[11px] font-mono text-[#52525B] mb-1"
                      >
                        Badge Role
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['viewer', 'member', 'vip', 'mod'] as const).map((r) => (
                          <button
                            id={r === 'viewer' ? 'role-viewer-btn' : undefined}
                            key={r}
                            type="button"
                            onClick={() => handlers.handleChatRoleChange(r)}
                            className={`py-2 rounded-lg text-[10px] font-mono uppercase font-bold border transition-colors ${
                              states.chatRole === r
                                ? 'bg-zinc-950 border-zinc-500 text-zinc-300'
                                : 'bg-[#F4F4F5] border-[#D4D4D8] text-[#52525B] hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="chat-msg-input"
                      className="block text-[11px] font-mono text-[#52525B] mb-1"
                    >
                      Pesan Chat
                    </label>
                    <input
                      id="chat-msg-input"
                      type="text"
                      value={states.chatMessage}
                      onChange={(e) => handlers.handleChatMessageChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlers.handleSendSingleChat()}
                      placeholder="Ketik pesan untuk ditampilkan di stage overlay..."
                      className="w-full px-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg text-white font-sans focus:outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#52525B] font-mono">Emote:</span>
                      {[':catJam:', ':hype:', ':pog:', ':fire:'].map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => handlers.handleInsertEmote(emo)}
                          className="px-2 py-1 rounded bg-[#F4F4F5] hover:bg-[#E4E4E7] border border-[#D4D4D8] text-[11px] font-mono text-zinc-300 transition-colors"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handlers.handleSendSingleChat}
                      className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Chat ke OBS</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-sm font-bold text-white">
                      Burst Chat Simulation (Stress Test)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#52525B]">
                    Case 03: Queue Stress Test
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {states.burstPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlers.handleSelectBurstPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        states.selectedBurstPreset.id === preset.id
                          ? 'bg-zinc-950/30 border-zinc-400/60 shadow-md shadow-zinc-950/40'
                          : 'bg-[#F4F4F5] border-[#D4D4D8] hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{preset.name}</div>
                      <div className="text-[10px] text-[#52525B] mt-1">{preset.subtitle}</div>
                      <div className="text-[10px] font-mono text-zinc-300 mt-2">
                        Interval: {preset.delayMs}ms
                      </div>
                    </button>
                  ))}
                </div>

                {states.isBurstRunning && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#F4F4F5] border border-[#D4D4D8]">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-300">Menembakkan antrean chat...</span>
                      <span className="text-white font-bold">{states.burstProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#E4E4E7] overflow-hidden">
                      <div
                        className="h-full bg-zinc-500 transition-all duration-100"
                        style={{ width: `${states.burstProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#52525B] font-mono">
                    Staggered window buffer: {states.selectedBurstPreset.count} chat berturut-turut
                  </span>
                  <button
                    type="button"
                    disabled={states.isBurstRunning}
                    onClick={handlers.handleLaunchBurst}
                    className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Luncurkan Burst Simulation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {states.activeTab === 'donation' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white">Donation Alert Simulator</h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#52525B]">
                    Case 04 & 05: Saweria Test
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="donor-name-input"
                      className="block text-[11px] font-mono text-[#52525B] mb-1"
                    >
                      Nama Donatur / Sultan
                    </label>
                    <input
                      id="donor-name-input"
                      type="text"
                      value={states.donorName}
                      onChange={(e) => handlers.handleDonorNameChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="nom-10k-btn"
                      className="block text-[11px] font-mono text-[#52525B] mb-1"
                    >
                      Pilihan Nominal Saweria
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[10000, 50000, 100000, 500000, 1000000].map((nom) => (
                        <button
                          id={nom === 10000 ? 'nom-10k-btn' : undefined}
                          key={nom}
                          type="button"
                          onClick={() => handlers.handleDonationAmountChange(nom)}
                          className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                            states.donationAmount === nom
                              ? 'bg-amber-950 border-amber-500 text-amber-300'
                              : 'bg-[#F4F4F5] border-[#D4D4D8] text-[#52525B] hover:text-white'
                          }`}
                        >
                          Rp {nom >= 1000000 ? '1M' : `${nom / 1000}k`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="don-msg-input"
                      className="block text-[11px] font-mono text-[#52525B] mb-1"
                    >
                      Pesan Donasi (Saweria Tip)
                    </label>
                    <textarea
                      id="don-msg-input"
                      rows={2}
                      value={states.donationMessage}
                      onChange={(e) => handlers.handleDonationMessageChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg text-white font-sans focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlers.handleOpenConfigModal}
                      className="px-3 py-2 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] border border-amber-500/30 hover:border-amber-400 text-xs font-bold text-amber-300 flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>
                        FX: {states.fxConfig.template} ({states.fxConfig.durationSec}s)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handlers.handleTriggerDonation}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Trigger Donation Alert</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-bold text-white">TTS Voice Synthesizer Module</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="tts-voice-select"
                      className="block text-[11px] font-mono text-[#52525B] mb-1"
                    >
                      Pilihan Suara TTS
                    </label>
                    <select
                      id="tts-voice-select"
                      value={states.ttsVoice}
                      className="w-full px-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg text-white font-mono focus:outline-none focus:border-zinc-400"
                      disabled
                    >
                      <option>{states.ttsVoice}</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="tts-volume-input"
                      className="block text-[11px] font-mono text-[#52525B] mb-1"
                    >
                      Volume Audio ({states.ttsVolume}%)
                    </label>
                    <div className="flex items-center gap-2 pt-1.5">
                      <Volume2 className="w-4 h-4 text-zinc-400" />
                      <input
                        id="tts-volume-input"
                        type="range"
                        min={0}
                        max={100}
                        value={states.ttsVolume}
                        className="w-full accent-zinc-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 space-y-5">
          <ObsVirtualCanvas
            activeAlert={states.activeAlert}
            stageChats={states.stageChats}
            onClearStage={handlers.handleClearStage}
          />

          <EventTracePanel logs={states.traceLogs} onClearLogs={handlers.handleClearLogs} />
        </div>
      </div>

      <DonationConfigModal
        isOpen={states.isConfigModalOpen}
        onClose={handlers.handleCloseConfigModal}
        config={states.fxConfig}
        onSaveConfig={handlers.handleSaveFxConfig}
        onTestSound={handlers.handleTestSound}
      />
    </div>
  );
}
