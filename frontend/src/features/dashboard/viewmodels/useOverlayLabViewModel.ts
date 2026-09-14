import { dashboardSocket } from '@core/ws/socketClient';
import { useEffect, useReducer, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  BurstPreset,
  DonationConfigState,
  StageAlert,
  StageChat,
  TestingTab,
  TraceLogItem,
} from '../types/overlay-lab.types';
import { playMelodicChimeC6E6G6 } from '../utils/audioSynth';

interface State {
  activeTab: TestingTab;
  chatUsername: string;
  chatRole: 'mod' | 'vip' | 'member' | 'viewer';
  chatMessage: string;
  selectedBurstPreset: BurstPreset;
  isBurstRunning: boolean;
  burstProgress: number;
  donorName: string;
  donationAmount: number;
  donationMessage: string;
  isConfigModalOpen: boolean;
  fxConfig: DonationConfigState;
  ttsVoice: string;
  ttsSpeed: number;
  ttsVolume: number;
  activeAlert: StageAlert | null;
  stageChats: StageChat[];
  traceLogs: TraceLogItem[];
  copiedUrl: boolean;
}

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: TestingTab }
  | { type: 'SET_CHAT_USERNAME'; payload: string }
  | { type: 'SET_CHAT_ROLE'; payload: 'mod' | 'vip' | 'member' | 'viewer' }
  | { type: 'SET_CHAT_MESSAGE'; payload: string }
  | { type: 'SET_BURST_PRESET'; payload: BurstPreset }
  | { type: 'SET_BURST_RUNNING'; payload: boolean }
  | { type: 'SET_BURST_PROGRESS'; payload: number }
  | { type: 'SET_DONOR_NAME'; payload: string }
  | { type: 'SET_DONATION_AMOUNT'; payload: number }
  | { type: 'SET_DONATION_MESSAGE'; payload: string }
  | { type: 'SET_CONFIG_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_FX_CONFIG'; payload: DonationConfigState }
  | { type: 'SET_TTS_VOICE'; payload: string }
  | { type: 'SET_TTS_SPEED'; payload: number }
  | { type: 'SET_TTS_VOLUME'; payload: number }
  | { type: 'SET_ACTIVE_ALERT'; payload: StageAlert | null }
  | { type: 'TICK_ALERT'; payload: number }
  | { type: 'ADD_STAGE_CHAT'; payload: StageChat }
  | { type: 'CLEAR_STAGE' }
  | { type: 'ADD_TRACE_LOG'; payload: TraceLogItem }
  | { type: 'CLEAR_TRACE_LOGS' }
  | { type: 'SET_COPIED_URL'; payload: boolean };

const BURST_PRESETS: BurstPreset[] = [
  {
    id: 'preset-5',
    name: '5 Chats (Mini Wave)',
    count: 5,
    delayMs: 120,
    subtitle: 'Simulasi lonjakan chat ringan',
  },
  {
    id: 'preset-20',
    name: '20 Chats (Hype Raid)',
    count: 20,
    delayMs: 80,
    subtitle: 'Simulasi raid komunitas atau hype chant',
  },
  {
    id: 'preset-50',
    name: '50 Chats (Storm)',
    count: 50,
    delayMs: 40,
    subtitle: 'Stress-test buffer antrean OBS canvas',
  },
];

const INITIAL_LOGS: TraceLogItem[] = [
  {
    id: 'log-init-1',
    timestamp: '11:45:02',
    tag: '[WS CLIENT]',
    type: 'ws_send',
    content: 'Connected to Streamerbot Hub Gateway ws://127.0.0.1:8080/ws/alerts',
  },
  {
    id: 'log-init-2',
    timestamp: '11:45:03',
    tag: '[OVERLAY OBS]',
    type: 'ws_recv',
    content: 'OBS Browser Source synced: Canvas 1920x1080 transparent',
  },
];

const INITIAL_STAGE_CHATS: StageChat[] = [
  {
    id: 'msg-1',
    username: 'kevin_mod',
    role: 'mod',
    message: 'Selamat datang di testing overlay lab!',
    timestamp: '11:44',
  },
  {
    id: 'msg-2',
    username: 'dimas_pro',
    role: 'member',
    message: 'Halo bang, gameplay mantap!',
    timestamp: '11:45',
  },
];

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_CHAT_USERNAME':
      return { ...state, chatUsername: action.payload };
    case 'SET_CHAT_ROLE':
      return { ...state, chatRole: action.payload };
    case 'SET_CHAT_MESSAGE':
      return { ...state, chatMessage: action.payload };
    case 'SET_BURST_PRESET':
      return { ...state, selectedBurstPreset: action.payload };
    case 'SET_BURST_RUNNING':
      return { ...state, isBurstRunning: action.payload };
    case 'SET_BURST_PROGRESS':
      return { ...state, burstProgress: action.payload };
    case 'SET_DONOR_NAME':
      return { ...state, donorName: action.payload };
    case 'SET_DONATION_AMOUNT':
      return { ...state, donationAmount: action.payload };
    case 'SET_DONATION_MESSAGE':
      return { ...state, donationMessage: action.payload };
    case 'SET_CONFIG_MODAL_OPEN':
      return { ...state, isConfigModalOpen: action.payload };
    case 'SET_FX_CONFIG':
      return { ...state, fxConfig: action.payload };
    case 'SET_TTS_VOICE':
      return { ...state, ttsVoice: action.payload };
    case 'SET_TTS_SPEED':
      return { ...state, ttsSpeed: action.payload };
    case 'SET_TTS_VOLUME':
      return { ...state, ttsVolume: action.payload };
    case 'SET_ACTIVE_ALERT':
      return { ...state, activeAlert: action.payload };
    case 'TICK_ALERT':
      if (!state.activeAlert) return state;
      if (state.activeAlert.remainingSec <= action.payload) {
        return { ...state, activeAlert: null };
      }
      return {
        ...state,
        activeAlert: {
          ...state.activeAlert,
          remainingSec: state.activeAlert.remainingSec - action.payload,
        },
      };
    case 'ADD_STAGE_CHAT':
      return {
        ...state,
        stageChats: [action.payload, ...state.stageChats].slice(0, 15),
      };
    case 'CLEAR_STAGE':
      return { ...state, activeAlert: null, stageChats: [] };
    case 'ADD_TRACE_LOG':
      return {
        ...state,
        traceLogs: [action.payload, ...state.traceLogs].slice(0, 40),
      };
    case 'CLEAR_TRACE_LOGS':
      return { ...state, traceLogs: [] };
    case 'SET_COPIED_URL':
      return { ...state, copiedUrl: action.payload };
    default:
      return state;
  }
}

export function useOverlayLabViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: TestingTab = tabParam === 'donation' ? 'donation' : 'chat';

  const [state, dispatch] = useReducer(reducer, {
    activeTab: initialTab,
    chatUsername: 'budi_santoso',
    chatRole: 'mod',
    chatMessage: 'GGWP gameplay mantap bang! 🔥',
    selectedBurstPreset: BURST_PRESETS[0],
    isBurstRunning: false,
    burstProgress: 0,
    donorName: 'Sultan_Streaming',
    donationAmount: 50000,
    donationMessage: 'Semangat live stream-nya bang! GGWP 🔥☕',
    isConfigModalOpen: false,
    fxConfig: {
      template: 'electric-lightning',
      soundType: 'melodic-chime-c6',
      durationSec: 4.0,
    },
    ttsVoice: 'Google Bahasa Indonesia (Female)',
    ttsSpeed: 1.0,
    ttsVolume: 80,
    activeAlert: null,
    stageChats: INITIAL_STAGE_CHATS,
    traceLogs: INITIAL_LOGS,
    copiedUrl: false,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.activeAlert) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK_ALERT', payload: 0.1 });
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.activeAlert]);

  const addTrace = (type: TraceLogItem['type'], tag: string, content: string) => {
    const time = new Date().toTimeString().split(' ')[0];
    dispatch({
      type: 'ADD_TRACE_LOG',
      payload: {
        id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: time,
        tag,
        type,
        content,
      },
    });
  };

  const handleTabSelect = (tab: TestingTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleChatUsernameChange = (val: string) => {
    dispatch({ type: 'SET_CHAT_USERNAME', payload: val });
  };

  const handleChatRoleChange = (role: 'mod' | 'vip' | 'member' | 'viewer') => {
    dispatch({ type: 'SET_CHAT_ROLE', payload: role });
  };

  const handleChatMessageChange = (val: string) => {
    dispatch({ type: 'SET_CHAT_MESSAGE', payload: val });
  };

  const handleInsertEmote = (emoteTag: string) => {
    dispatch({
      type: 'SET_CHAT_MESSAGE',
      payload: `${state.chatMessage} ${emoteTag}`.trim(),
    });
  };

  const handleSendSingleChat = () => {
    if (!state.chatMessage.trim()) return;

    const payload = {
      username: state.chatUsername.trim() || 'Viewer',
      role: state.chatRole,
      message: state.chatMessage.trim(),
    };

    dashboardSocket.send('chat:send', payload);

    dispatch({
      type: 'ADD_STAGE_CHAT',
      payload: {
        id: `chat-${Date.now()}`,
        username: payload.username,
        role: payload.role,
        message: payload.message,
        timestamp: new Date().toTimeString().slice(0, 5),
      },
    });

    addTrace('ws_send', '[WS SEND chat:send]', `payload: ${JSON.stringify(payload)}`);

    dispatch({ type: 'SET_CHAT_MESSAGE', payload: '' });
  };

  const handleSelectBurstPreset = (preset: BurstPreset) => {
    dispatch({ type: 'SET_BURST_PRESET', payload: preset });
  };

  const handleLaunchBurst = () => {
    if (state.isBurstRunning) return;
    const preset = state.selectedBurstPreset;
    dispatch({ type: 'SET_BURST_RUNNING', payload: true });
    dispatch({ type: 'SET_BURST_PROGRESS', payload: 0 });

    addTrace(
      'burst',
      '[BURST QUEUE START]',
      `Spawning ${preset.count} staggered messages (${preset.delayMs}ms interval)`
    );

    let sent = 0;
    const interval = setInterval(() => {
      sent += 1;
      const randomUsers = ['dimas_pro', 'kevin_mod', 'Budi_Santoso', 'gamer_santai', 'sultan_99'];
      const randomMsgs = [
        'GGWP bang! 🔥',
        'Cat jam terusss 🐱',
        'Letsgooo!',
        'Keren banget timing ultinya!',
        'Hype raid!',
      ];
      const randomRoles: ('mod' | 'vip' | 'member' | 'viewer')[] = [
        'mod',
        'vip',
        'member',
        'viewer',
      ];

      const u = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      const m = randomMsgs[Math.floor(Math.random() * randomMsgs.length)];
      const r = randomRoles[Math.floor(Math.random() * randomRoles.length)];

      dispatch({
        type: 'ADD_STAGE_CHAT',
        payload: {
          id: `burst-chat-${Date.now()}-${sent}`,
          username: u,
          role: r,
          message: m,
          timestamp: new Date().toTimeString().slice(0, 5),
        },
      });

      dispatch({
        type: 'SET_BURST_PROGRESS',
        payload: Math.round((sent / preset.count) * 100),
      });

      if (sent >= preset.count) {
        clearInterval(interval);
        dispatch({ type: 'SET_BURST_RUNNING', payload: false });
        addTrace(
          'burst',
          '[BURST QUEUE FLUSH]',
          `Dispatched all ${preset.count} messages into OBS canvas queue`
        );
      }
    }, preset.delayMs);
  };

  const handleDonorNameChange = (val: string) => {
    dispatch({ type: 'SET_DONOR_NAME', payload: val });
  };

  const handleDonationAmountChange = (val: number) => {
    dispatch({ type: 'SET_DONATION_AMOUNT', payload: val });
  };

  const handleDonationMessageChange = (val: string) => {
    dispatch({ type: 'SET_DONATION_MESSAGE', payload: val });
  };

  const handleOpenConfigModal = () => {
    dispatch({ type: 'SET_CONFIG_MODAL_OPEN', payload: true });
  };

  const handleCloseConfigModal = () => {
    dispatch({ type: 'SET_CONFIG_MODAL_OPEN', payload: false });
  };

  const handleSaveFxConfig = (newConfig: DonationConfigState) => {
    dispatch({ type: 'SET_FX_CONFIG', payload: newConfig });
    addTrace(
      'ws_recv',
      '[CONFIG SAVED]',
      `Applied template: ${newConfig.template}, duration: ${newConfig.durationSec}s`
    );
  };

  const handleTestSound = () => {
    playMelodicChimeC6E6G6();
    addTrace(
      'audio',
      '[WEB AUDIO API]',
      'OscillatorNode: C6(1046Hz) -> E6(1318Hz) -> G6(1568Hz) [Chime Synthesized]'
    );
  };

  const handleTriggerDonation = () => {
    playMelodicChimeC6E6G6();

    const payload = {
      donorName: state.donorName.trim() || 'Anonymous Supporter',
      amount: state.donationAmount,
      currency: 'Rp',
      message: state.donationMessage.trim() || 'Semangat live stream-nya!',
      template: state.fxConfig.template,
    };

    dashboardSocket.send('alert:test', payload);

    dispatch({
      type: 'SET_ACTIVE_ALERT',
      payload: {
        id: `alert-${Date.now()}`,
        donorName: payload.donorName,
        amount: payload.amount,
        currency: payload.currency,
        message: payload.message,
        template: payload.template,
        durationSec: state.fxConfig.durationSec,
        remainingSec: state.fxConfig.durationSec,
      },
    });

    addTrace('ws_send', '[WS SEND alert:test]', `payload: ${JSON.stringify(payload)}`);
    addTrace(
      'audio',
      '[WEB AUDIO API]',
      'Synthesized C6-E6-G6 chime sequence for active OBS alert'
    );
  };

  const handleClearStage = () => {
    dispatch({ type: 'CLEAR_STAGE' });
    addTrace('ws_recv', '[STAGE RESET]', 'Cleared all live elements on virtual stage');
  };

  const handleClearLogs = () => {
    dispatch({ type: 'CLEAR_TRACE_LOGS' });
  };

  const handleCopyObsUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(`${origin}/overlay`);
    dispatch({ type: 'SET_COPIED_URL', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_COPIED_URL', payload: false });
    }, 2000);
  };

  return {
    states: {
      activeTab: state.activeTab,
      chatUsername: state.chatUsername,
      chatRole: state.chatRole,
      chatMessage: state.chatMessage,
      selectedBurstPreset: state.selectedBurstPreset,
      burstPresets: BURST_PRESETS,
      isBurstRunning: state.isBurstRunning,
      burstProgress: state.burstProgress,
      donorName: state.donorName,
      donationAmount: state.donationAmount,
      donationMessage: state.donationMessage,
      isConfigModalOpen: state.isConfigModalOpen,
      fxConfig: state.fxConfig,
      ttsVoice: state.ttsVoice,
      ttsSpeed: state.ttsSpeed,
      ttsVolume: state.ttsVolume,
      activeAlert: state.activeAlert,
      stageChats: state.stageChats,
      traceLogs: state.traceLogs,
      copiedUrl: state.copiedUrl,
    },
    handlers: {
      handleTabSelect,
      handleChatUsernameChange,
      handleChatRoleChange,
      handleChatMessageChange,
      handleInsertEmote,
      handleSendSingleChat,
      handleSelectBurstPreset,
      handleLaunchBurst,
      handleDonorNameChange,
      handleDonationAmountChange,
      handleDonationMessageChange,
      handleOpenConfigModal,
      handleCloseConfigModal,
      handleSaveFxConfig,
      handleTestSound,
      handleTriggerDonation,
      handleClearStage,
      handleClearLogs,
      handleCopyObsUrl,
    },
  };
}
