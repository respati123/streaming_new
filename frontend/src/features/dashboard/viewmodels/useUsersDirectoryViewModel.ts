import { apiClient } from '@core/http/api-client';
import { useEffect, useMemo, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  AutoModerationRule,
  BlacklistedUser,
  LoyaltyTier,
  LoyaltyTierConfig,
  PointsRuleConfig,
  UserRole,
  ViewerRecord,
} from '../types/user-management.types';

interface State {
  viewers: ViewerRecord[];
  isLoading: boolean;
  search: string;
  roleFilter: string;
  tierFilter: string;
  selectedViewerId: string | null;
  activeTab: 'directory' | 'rules';
  tiers: LoyaltyTierConfig[];
  pointsRules: PointsRuleConfig[];
  moderationRules: AutoModerationRule[];
  blacklistedUsers: BlacklistedUser[];
  bannedWords: string[];
}

type Action =
  | { type: 'SET_VIEWERS'; payload: ViewerRecord[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: string }
  | { type: 'SET_TIER_FILTER'; payload: string }
  | { type: 'SET_SELECTED_VIEWER_ID'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: 'directory' | 'rules' }
  | { type: 'UPDATE_VIEWER_POINTS'; payload: { viewerId: string; delta: number } }
  | { type: 'UPDATE_VIEWER_ROLE'; payload: { viewerId: string; role: UserRole } }
  | { type: 'TOGGLE_MOD_RULE'; payload: string }
  | { type: 'ADD_BANNED_WORD'; payload: string }
  | { type: 'REMOVE_BANNED_WORD'; payload: string }
  | { type: 'BAN_USER'; payload: { viewerId: string; reason: string } }
  | { type: 'UNBAN_USER'; payload: string };

const INITIAL_TIERS: LoyaltyTierConfig[] = [
  {
    id: 'diamond',
    name: 'Diamond Tier',
    minPoints: 20000,
    multiplier: 2.5,
    perks: ['VIP Priority Sound Alert', 'Custom Neon Stage Badge', 'Uncapped Emote Burst'],
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/60 border-cyan-500/40',
    borderColor: 'border-cyan-500/30 shadow-cyan-950/20',
  },
  {
    id: 'gold',
    name: 'Gold Tier',
    minPoints: 10000,
    multiplier: 1.8,
    perks: ['Golden Star Badge', '1.8x Saweria Points Multiplier', 'Sub-only Emotes Access'],
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/60 border-amber-500/40',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'silver',
    name: 'Silver Tier',
    minPoints: 3000,
    multiplier: 1.2,
    perks: ['Silver Badge', '1.2x Chat Points Multiplier', 'Early Stream Room Notification'],
    color: 'text-slate-300',
    badgeBg: 'bg-slate-800/60 border-slate-600/40',
    borderColor: 'border-slate-700/40',
  },
  {
    id: 'bronze',
    name: 'Bronze Tier',
    minPoints: 0,
    multiplier: 1.0,
    perks: ['Standard Chat Badge', 'Base 1x Point Accumulation'],
    color: 'text-amber-600',
    badgeBg: 'bg-amber-950/30 border-amber-700/40',
    borderColor: 'border-zinc-800',
  },
];

const INITIAL_POINTS_RULES: PointsRuleConfig[] = [
  {
    id: 'rule-chat',
    title: 'Chat Activity Reward',
    description: 'Dapatkan poin setiap mengirimkan 10 chat aktif saat stream.',
    pointsAwarded: 5,
    cooldownText: '10 chat / 2 menit',
  },
  {
    id: 'rule-saweria',
    title: 'Saweria / Tip Reward',
    description: 'Bonus poin otomatis setiap donasi Saweria masuk via webhook.',
    pointsAwarded: 100,
    cooldownText: 'Per Rp 10.000 donasi',
  },
  {
    id: 'rule-checkin',
    title: 'Daily Stream Check-in',
    description: 'Poin absensi harian pertama kali penonton mengirim chat.',
    pointsAwarded: 50,
    cooldownText: '1x per stream live',
  },
];

const INITIAL_MOD_RULES: AutoModerationRule[] = [
  {
    id: 'mod-spam',
    name: 'Anti-Spam Flood Protection',
    description: 'Otomatis timeout penonton yang mengirim pesan lebih dari batas dalam 5 detik.',
    enabled: true,
    threshold: 4,
    unit: 'pesan / 5 detik',
  },
  {
    id: 'mod-caps',
    name: 'Excessive Caps Lock Filter',
    description: 'Hapus atau peringatkan pesan jika huruf kapital melebihi persentase.',
    enabled: true,
    threshold: 70,
    unit: '% caps lock',
  },
  {
    id: 'mod-emotes',
    name: 'Emote Spam Limiter',
    description: 'Batasi jumlah emote yang dapat dikirimkan dalam satu baris chat tunggal.',
    enabled: true,
    threshold: 6,
    unit: 'emotes / baris',
  },
  {
    id: 'mod-links',
    name: 'Unapproved Link & URL Shield',
    description: 'Blokir link eksternal yang tidak ada dalam daftar whitelist domain.',
    enabled: true,
    threshold: 0,
    unit: 'link',
  },
];

const INITIAL_BLACKLIST: BlacklistedUser[] = [
  {
    id: 'bl-1',
    username: 'toxic_spammer99',
    reason: 'Spam link phising YouTube live',
    bannedAt: '02 Sep 2026',
    bannedBy: 'kevin_mod',
  },
  {
    id: 'bl-2',
    username: 'bot_ads_crypto',
    reason: 'Iklan judi online dan crypto bot',
    bannedAt: '01 Sep 2026',
    bannedBy: 'Budi_Santoso',
  },
];

const INITIAL_MOCK_VIEWERS: ViewerRecord[] = [
  {
    id: 'usr-1',
    name: 'Budi_Santoso',
    role: 'moderator',
    tier: 'diamond',
    points: 25400,
    totalMessagesSent: 1482,
    totalDonations: 1250000,
    firstSeenAt: '12 Jan 2026',
    lastSeenAt: '2 menit lalu',
    youtubeHandle: '@budisantoso',
    youtubeChannelId: 'UC_budi9988',
    isOnline: true,
    warningCount: 0,
    timeoutCount: 0,
  },
  {
    id: 'usr-2',
    name: 'Sultan_Streaming',
    role: 'vip',
    tier: 'diamond',
    points: 48200,
    totalMessagesSent: 892,
    totalDonations: 4500000,
    firstSeenAt: '05 Feb 2026',
    lastSeenAt: '5 menit lalu',
    youtubeHandle: '@sultanstream',
    youtubeChannelId: 'UC_sultan007',
    isOnline: true,
    warningCount: 0,
    timeoutCount: 0,
  },
  {
    id: 'usr-3',
    name: 'dimas_pro',
    role: 'member',
    tier: 'gold',
    points: 14800,
    totalMessagesSent: 640,
    totalDonations: 350000,
    firstSeenAt: '20 Feb 2026',
    lastSeenAt: '12 menit lalu',
    youtubeHandle: '@dimaspro',
    youtubeChannelId: 'UC_dimas332',
    isOnline: true,
    warningCount: 0,
    timeoutCount: 0,
  },
  {
    id: 'usr-4',
    name: 'kevin_mod',
    role: 'moderator',
    tier: 'gold',
    points: 18200,
    totalMessagesSent: 1120,
    totalDonations: 500000,
    firstSeenAt: '01 Jan 2026',
    lastSeenAt: '15 menit lalu',
    youtubeHandle: '@kevinmod',
    youtubeChannelId: 'UC_kevin99',
    isOnline: false,
    warningCount: 0,
    timeoutCount: 0,
  },
  {
    id: 'usr-5',
    name: 'rizky_vip',
    role: 'vip',
    tier: 'silver',
    points: 8900,
    totalMessagesSent: 410,
    totalDonations: 200000,
    firstSeenAt: '10 Mar 2026',
    lastSeenAt: '30 menit lalu',
    youtubeHandle: '@rizkyvip',
    youtubeChannelId: 'UC_rizky123',
    isOnline: true,
    warningCount: 1,
    timeoutCount: 0,
  },
  {
    id: 'usr-6',
    name: 'andi_gaming',
    role: 'viewer',
    tier: 'bronze',
    points: 1250,
    totalMessagesSent: 124,
    totalDonations: 0,
    firstSeenAt: '15 Apr 2026',
    lastSeenAt: '1 jam lalu',
    youtubeHandle: '@andigamer',
    youtubeChannelId: 'UC_andi777',
    isOnline: false,
    warningCount: 0,
    timeoutCount: 0,
  },
];

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_VIEWERS':
      return { ...state, viewers: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_ROLE_FILTER':
      return { ...state, roleFilter: action.payload };
    case 'SET_TIER_FILTER':
      return { ...state, tierFilter: action.payload };
    case 'SET_SELECTED_VIEWER_ID':
      return { ...state, selectedViewerId: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'UPDATE_VIEWER_POINTS':
      return {
        ...state,
        viewers: state.viewers.map((v) =>
          v.id === action.payload.viewerId
            ? {
                ...v,
                points: Math.max(0, v.points + action.payload.delta),
                tier:
                  v.points + action.payload.delta >= 20000
                    ? 'diamond'
                    : v.points + action.payload.delta >= 10000
                      ? 'gold'
                      : v.points + action.payload.delta >= 3000
                        ? 'silver'
                        : 'bronze',
              }
            : v
        ),
      };
    case 'UPDATE_VIEWER_ROLE':
      return {
        ...state,
        viewers: state.viewers.map((v) =>
          v.id === action.payload.viewerId ? { ...v, role: action.payload.role } : v
        ),
      };
    case 'TOGGLE_MOD_RULE':
      return {
        ...state,
        moderationRules: state.moderationRules.map((r) =>
          r.id === action.payload ? { ...r, enabled: !r.enabled } : r
        ),
      };
    case 'ADD_BANNED_WORD':
      if (state.bannedWords.includes(action.payload.toLowerCase())) return state;
      return { ...state, bannedWords: [...state.bannedWords, action.payload.toLowerCase()] };
    case 'REMOVE_BANNED_WORD':
      return { ...state, bannedWords: state.bannedWords.filter((w) => w !== action.payload) };
    case 'BAN_USER': {
      const target = state.viewers.find((v) => v.id === action.payload.viewerId);
      return {
        ...state,
        viewers: state.viewers.filter((v) => v.id !== action.payload.viewerId),
        selectedViewerId: null,
        blacklistedUsers: [
          ...state.blacklistedUsers,
          {
            id: `bl-${Date.now()}`,
            username: target?.name || 'unknown_user',
            reason: action.payload.reason,
            bannedAt: 'Baru saja',
            bannedBy: 'Host / Admin',
          },
        ],
      };
    }
    case 'UNBAN_USER':
      return {
        ...state,
        blacklistedUsers: state.blacklistedUsers.filter((b) => b.id !== action.payload),
      };
    default:
      return state;
  }
}

export function useUsersDirectoryViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'rules' ? 'rules' : 'directory';
  const initialViewerId = searchParams.get('viewer');

  const [state, dispatch] = useReducer(reducer, {
    viewers: INITIAL_MOCK_VIEWERS,
    isLoading: false,
    search: '',
    roleFilter: 'all',
    tierFilter: 'all',
    selectedViewerId: initialViewerId || null,
    activeTab: initialTab,
    tiers: INITIAL_TIERS,
    pointsRules: INITIAL_POINTS_RULES,
    moderationRules: INITIAL_MOD_RULES,
    blacklistedUsers: INITIAL_BLACKLIST,
    bannedWords: ['phising', 'judi online', 'slot gacor', 'free giveaway'],
  });

  useEffect(() => {
    let isSubscribed = true;
    async function loadChatters() {
      try {
        interface ApiChatterRecord {
          id: string;
          name?: string | null;
          role?: string | null;
          tier?: string | null;
          points?: number | null;
          totalMessagesSent?: number | string | null;
          totalDonations?: number | string | null;
          firstSeenAt?: string | null;
          lastSeenAt?: string | null;
          youtubeHandle?: string | null;
          youtubeChannelId?: string | null;
        }
        const res = await apiClient.get<{ data: ApiChatterRecord[] }>('/streams/chatters/all');
        if (isSubscribed && res.data?.data && res.data.data.length > 0) {
          const apiViewers: ViewerRecord[] = res.data.data.map((u, i) => {
            const pts = u.points || INITIAL_MOCK_VIEWERS[i % INITIAL_MOCK_VIEWERS.length].points;
            const calculatedTier: LoyaltyTier =
              pts >= 20000 ? 'diamond' : pts >= 10000 ? 'gold' : pts >= 3000 ? 'silver' : 'bronze';
            return {
              id: u.id,
              name: u.name || 'Anonymous',
              role: (u.role === 'moderator'
                ? 'moderator'
                : u.role === 'admin'
                  ? 'admin'
                  : u.role === 'member'
                    ? 'member'
                    : 'viewer') as UserRole,
              tier: (u.tier as LoyaltyTier) || calculatedTier,
              points: pts,
              totalMessagesSent: Number(u.totalMessagesSent) || 12,
              totalDonations: Number(u.totalDonations) || 0,
              firstSeenAt: u.firstSeenAt
                ? new Date(u.firstSeenAt).toLocaleDateString('id-ID')
                : '01 Jan 2026',
              lastSeenAt: u.lastSeenAt
                ? new Date(u.lastSeenAt).toLocaleDateString('id-ID')
                : 'Hari ini',
              youtubeHandle:
                u.youtubeHandle || `@${(u.name || 'viewer').toLowerCase().replace(/\s+/g, '_')}`,
              youtubeChannelId: u.youtubeChannelId || null,
              isOnline: true,
              warningCount: 0,
              timeoutCount: 0,
            };
          });
          const merged = [...apiViewers];
          for (const mock of INITIAL_MOCK_VIEWERS) {
            if (!merged.some((m) => m.name === mock.name)) {
              merged.push(mock);
            }
          }
          dispatch({ type: 'SET_VIEWERS', payload: merged });
        }
      } catch {
        // Fallback to mock viewers
      }
    }
    loadChatters();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const filteredViewers = useMemo(() => {
    return state.viewers.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(state.search.toLowerCase()) ||
        Boolean(v.youtubeHandle?.toLowerCase().includes(state.search.toLowerCase())) ||
        Boolean(v.youtubeChannelId?.toLowerCase().includes(state.search.toLowerCase()));

      const matchesRole =
        state.roleFilter === 'all' || v.role.toLowerCase() === state.roleFilter.toLowerCase();
      const matchesTier =
        state.tierFilter === 'all' || v.tier.toLowerCase() === state.tierFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesTier;
    });
  }, [state.viewers, state.search, state.roleFilter, state.tierFilter]);

  const selectedViewer = useMemo(() => {
    if (!state.selectedViewerId) return null;
    return state.viewers.find((v) => v.id === state.selectedViewerId) || null;
  }, [state.viewers, state.selectedViewerId]);

  const summaryStats = useMemo(() => {
    const totalRecorded = state.viewers.length;
    const activeRecent = state.viewers.filter((v) => v.isOnline).length;
    const loyalMembers = state.viewers.filter(
      (v) => v.role === 'vip' || v.role === 'member' || v.tier === 'diamond'
    ).length;
    const totalPoints = state.viewers.reduce((acc, curr) => acc + curr.points, 0);

    return {
      totalRecorded,
      activeRecent,
      loyalMembers,
      totalPoints,
    };
  }, [state.viewers]);

  const handleSearchChange = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const handleRoleFilterChange = (role: string) => {
    dispatch({ type: 'SET_ROLE_FILTER', payload: role });
  };

  const handleTierFilterChange = (tier: string) => {
    dispatch({ type: 'SET_TIER_FILTER', payload: tier });
  };

  const handleSelectViewer = (viewerId: string) => {
    dispatch({ type: 'SET_SELECTED_VIEWER_ID', payload: viewerId });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('viewer', viewerId);
      return next;
    });
  };

  const handleCloseDrawer = () => {
    dispatch({ type: 'SET_SELECTED_VIEWER_ID', payload: null });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('viewer');
      return next;
    });
  };

  const handleTabChange = (tab: 'directory' | 'rules') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleUpdatePoints = (viewerId: string, delta: number) => {
    dispatch({ type: 'UPDATE_VIEWER_POINTS', payload: { viewerId, delta } });
  };

  const handleUpdateRole = (viewerId: string, role: UserRole) => {
    dispatch({ type: 'UPDATE_VIEWER_ROLE', payload: { viewerId, role } });
  };

  const handleApplyTimeout = (viewerId: string, _durationMinutes: number) => {
    dispatch({ type: 'SET_SELECTED_VIEWER_ID', payload: viewerId });
  };

  const handleBanUser = (viewerId: string, reason: string) => {
    dispatch({ type: 'BAN_USER', payload: { viewerId, reason } });
  };

  const handleUnbanUser = (userId: string) => {
    dispatch({ type: 'UNBAN_USER', payload: userId });
  };

  const handleToggleRule = (ruleId: string) => {
    dispatch({ type: 'TOGGLE_MOD_RULE', payload: ruleId });
  };

  const handleAddBannedWord = (word: string) => {
    dispatch({ type: 'ADD_BANNED_WORD', payload: word });
  };

  const handleRemoveBannedWord = (word: string) => {
    dispatch({ type: 'REMOVE_BANNED_WORD', payload: word });
  };

  const handleSaveRules = () => {};

  return {
    states: {
      viewers: filteredViewers,
      allViewersCount: state.viewers.length,
      selectedViewer,
      isDrawerOpen: !!state.selectedViewerId,
      activeTab: state.activeTab,
      search: state.search,
      roleFilter: state.roleFilter,
      tierFilter: state.tierFilter,
      summaryStats,
      tiers: state.tiers,
      pointsRules: state.pointsRules,
      moderationRules: state.moderationRules,
      blacklistedUsers: state.blacklistedUsers,
      bannedWords: state.bannedWords,
      isLoading: state.isLoading,
    },
    handlers: {
      handleSearchChange,
      handleRoleFilterChange,
      handleTierFilterChange,
      handleSelectViewer,
      handleCloseDrawer,
      handleTabChange,
      handleUpdatePoints,
      handleUpdateRole,
      handleApplyTimeout,
      handleBanUser,
      handleUnbanUser,
      handleToggleRule,
      handleAddBannedWord,
      handleRemoveBannedWord,
      handleSaveRules,
    },
  };
}
