export interface GifPreset {
  id: string;
  name: string;
  category: 'meme' | 'gold' | 'celebration' | 'anime' | 'retro';
  url: string;
  previewUrl: string;
}

export type AlertLayoutTemplate =
  | 'electric-lightning'
  | 'fire-glass'
  | 'top-banner'
  | 'side-badge'
  | 'epic-celebration';

export const DONATION_GIF_PRESETS: GifPreset[] = [
  {
    id: 'cat_jam',
    name: 'Cat Vibe Jam',
    category: 'meme',
    url: 'https://media.tenor.com/2s45_bY7dYMAAAAi/cat-jam.gif',
    previewUrl: 'https://media.tenor.com/2s45_bY7dYMAAAAi/cat-jam.gif',
  },
  {
    id: 'pop_cat',
    name: 'Pop Cat Hype',
    category: 'meme',
    url: 'https://media.tenor.com/EwbFp5jR9y4AAAAi/pop-cat.gif',
    previewUrl: 'https://media.tenor.com/EwbFp5jR9y4AAAAi/pop-cat.gif',
  },
  {
    id: 'gold_chest',
    name: 'Make It Rain Gold',
    category: 'gold',
    url: 'https://media.tenor.com/tZc3m_Y_dTkAAAAi/money-rain-make-it-rain.gif',
    previewUrl: 'https://media.tenor.com/tZc3m_Y_dTkAAAAi/money-rain-make-it-rain.gif',
  },
  {
    id: 'confetti_party',
    name: 'Confetti Party',
    category: 'celebration',
    url: 'https://media.tenor.com/dO20z0C6r_kAAAAi/confetti.gif',
    previewUrl: 'https://media.tenor.com/dO20z0C6r_kAAAAi/confetti.gif',
  },
  {
    id: 'pixel_coin',
    name: '8-Bit Retro Coin',
    category: 'retro',
    url: 'https://media.tenor.com/26W6yJv6oUoAAAAi/pixel-coin.gif',
    previewUrl: 'https://media.tenor.com/26W6yJv6oUoAAAAi/pixel-coin.gif',
  },
  {
    id: 'anime_dance',
    name: 'Anime Chibi Dance',
    category: 'anime',
    url: 'https://media.tenor.com/8Q2Wb_ZkX4YAAAAi/anime-dance.gif',
    previewUrl: 'https://media.tenor.com/8Q2Wb_ZkX4YAAAAi/anime-dance.gif',
  },
];
