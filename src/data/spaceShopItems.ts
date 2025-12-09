// Space-themed shop items for the Stellar Tuition platform
// Items are organized into categories that integrate with the leaderboard, boosters, and customization

export type SpaceItemCategory =
  | 'title'      // Leaderboard display titles
  | 'frame'      // Profile frames for leaderboard
  | 'avatar'     // Astronaut/character avatars
  | 'spaceship'  // Ships for Stellar Journey
  | 'booster'    // Gamification boosters (consumables)
  | 'celebration'; // Achievement animations

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface SpaceShopItem {
  id: string;
  name: string;
  description: string;
  category: SpaceItemCategory;
  price: number;
  rarity: ItemRarity;
  icon: string; // Emoji or icon identifier
  available: boolean;
  // For boosters only
  duration?: number; // Duration in days (for time-based boosters)
  effect?: string; // Effect description
  stackable?: boolean; // Can own multiple
}

// Titles - shown on leaderboard next to username
export const titleItems: SpaceShopItem[] = [
  {
    id: 'title-cosmic-cadet',
    name: 'Cosmic Cadet',
    description: 'A humble beginning for every space explorer',
    category: 'title',
    price: 100,
    rarity: 'common',
    icon: '🌟',
    available: true,
  },
  {
    id: 'title-star-seeker',
    name: 'Star Seeker',
    description: 'Always reaching for the stars',
    category: 'title',
    price: 250,
    rarity: 'common',
    icon: '⭐',
    available: true,
  },
  {
    id: 'title-nebula-navigator',
    name: 'Nebula Navigator',
    description: 'Masters the art of navigating cosmic clouds',
    category: 'title',
    price: 500,
    rarity: 'rare',
    icon: '🌌',
    available: true,
  },
  {
    id: 'title-galaxy-guardian',
    name: 'Galaxy Guardian',
    description: 'Protector of knowledge across the galaxy',
    category: 'title',
    price: 1000,
    rarity: 'rare',
    icon: '🛡️',
    available: true,
  },
  {
    id: 'title-asteroid-ace',
    name: 'Asteroid Ace',
    description: 'Dodges challenges with expert precision',
    category: 'title',
    price: 1500,
    rarity: 'epic',
    icon: '☄️',
    available: true,
  },
  {
    id: 'title-star-commander',
    name: 'Star Commander',
    description: 'Leads the way through the cosmos',
    category: 'title',
    price: 2500,
    rarity: 'epic',
    icon: '🚀',
    available: true,
  },
  {
    id: 'title-cosmic-legend',
    name: 'Cosmic Legend',
    description: 'A legendary explorer whose name echoes through space',
    category: 'title',
    price: 5000,
    rarity: 'legendary',
    icon: '👑',
    available: true,
  },
  {
    id: 'title-void-master',
    name: 'Void Master',
    description: 'Commands the darkness between stars',
    category: 'title',
    price: 7500,
    rarity: 'legendary',
    icon: '🌑',
    available: true,
  },
];

// Profile Frames - decorative borders on leaderboard
export const frameItems: SpaceShopItem[] = [
  {
    id: 'frame-basic-orbit',
    name: 'Basic Orbit',
    description: 'A simple orbital ring',
    category: 'frame',
    price: 150,
    rarity: 'common',
    icon: '⭕',
    available: true,
  },
  {
    id: 'frame-meteor-shower',
    name: 'Meteor Shower',
    description: 'Streaking meteors surround your profile',
    category: 'frame',
    price: 300,
    rarity: 'rare',
    icon: '🌠',
    available: true,
  },
  {
    id: 'frame-constellation',
    name: 'Constellation Border',
    description: 'Connect-the-dots star pattern',
    category: 'frame',
    price: 500,
    rarity: 'rare',
    icon: '✨',
    available: true,
  },
  {
    id: 'frame-nebula-glow',
    name: 'Nebula Glow',
    description: 'Ethereal purple and pink nebula effect',
    category: 'frame',
    price: 750,
    rarity: 'epic',
    icon: '🔮',
    available: true,
  },
  {
    id: 'frame-solar-flare',
    name: 'Solar Flare',
    description: 'Blazing energy radiates from your profile',
    category: 'frame',
    price: 1000,
    rarity: 'epic',
    icon: '🔥',
    available: true,
  },
  {
    id: 'frame-supernova',
    name: 'Supernova',
    description: 'An explosive stellar display',
    category: 'frame',
    price: 1500,
    rarity: 'legendary',
    icon: '💥',
    available: true,
  },
  {
    id: 'frame-black-hole',
    name: 'Black Hole',
    description: 'Gravity-bending dark matter frame',
    category: 'frame',
    price: 2000,
    rarity: 'legendary',
    icon: '🕳️',
    available: true,
  },
];

// Avatars - character appearances
export const avatarItems: SpaceShopItem[] = [
  {
    id: 'avatar-astronaut-blue',
    name: 'Space Cadet',
    description: 'Every explorer starts here',
    category: 'avatar',
    price: 0,
    rarity: 'common',
    icon: '🧑‍🚀',
    available: true,
  },
  {
    id: 'avatar-space-robot',
    name: 'Mecha Pilot',
    description: 'Friendly robotic companion',
    category: 'avatar',
    price: 200,
    rarity: 'common',
    icon: '🤖',
    available: true,
  },
  {
    id: 'avatar-star-fox',
    name: 'Star Fox',
    description: 'Swift and clever space explorer',
    category: 'avatar',
    price: 300,
    rarity: 'common',
    icon: '🦊',
    available: true,
  },
  {
    id: 'avatar-lunar-owl',
    name: 'Lunar Owl',
    description: 'Wise guardian of the night sky',
    category: 'avatar',
    price: 400,
    rarity: 'rare',
    icon: '🦉',
    available: true,
  },
  {
    id: 'avatar-alien-explorer',
    name: 'Alien Scholar',
    description: 'Friendly extraterrestrial genius',
    category: 'avatar',
    price: 500,
    rarity: 'rare',
    icon: '👽',
    available: true,
  },
  {
    id: 'avatar-cosmic-cat',
    name: 'Cosmic Cat',
    description: 'A curious feline from the stars',
    category: 'avatar',
    price: 600,
    rarity: 'rare',
    icon: '🐱',
    available: true,
  },
  {
    id: 'avatar-nebula-octopus',
    name: 'Nebula Kraken',
    description: 'Eight arms for eight subjects',
    category: 'avatar',
    price: 800,
    rarity: 'epic',
    icon: '🐙',
    available: true,
  },
  {
    id: 'avatar-cosmic-unicorn',
    name: 'Cosmic Unicorn',
    description: 'Magical steed of the cosmos',
    category: 'avatar',
    price: 1000,
    rarity: 'epic',
    icon: '🦄',
    available: true,
  },
  {
    id: 'avatar-galaxy-dragon',
    name: 'Galaxy Dragon',
    description: 'A majestic dragon made of stardust',
    category: 'avatar',
    price: 1500,
    rarity: 'legendary',
    icon: '🐉',
    available: true,
  },
  {
    id: 'avatar-phoenix-nebula',
    name: 'Phoenix Nova',
    description: 'Born from cosmic fire, rises eternal',
    category: 'avatar',
    price: 2000,
    rarity: 'legendary',
    icon: '🔥',
    available: true,
  },
];

// Spaceships - shown on Stellar Journey
export const spaceshipItems: SpaceShopItem[] = [
  {
    id: 'ship-starter-shuttle',
    name: 'Starter Shuttle',
    description: 'Your first vessel among the stars',
    category: 'spaceship',
    price: 0,
    rarity: 'common',
    icon: '🚀',
    available: true,
  },
  {
    id: 'ship-star-cruiser',
    name: 'Star Cruiser',
    description: 'Classic flying saucer design',
    category: 'spaceship',
    price: 300,
    rarity: 'common',
    icon: '🛸',
    available: true,
  },
  {
    id: 'ship-orbital-probe',
    name: 'Orbital Probe',
    description: 'Nimble satellite explorer',
    category: 'spaceship',
    price: 500,
    rarity: 'rare',
    icon: '🛰️',
    available: true,
  },
  {
    id: 'ship-comet-rider',
    name: 'Comet Rider',
    description: 'Surfs on cosmic ice trails',
    category: 'spaceship',
    price: 700,
    rarity: 'rare',
    icon: '☄️',
    available: true,
  },
  {
    id: 'ship-galaxy-voyager',
    name: 'Galaxy Voyager',
    description: 'Built for deep space exploration',
    category: 'spaceship',
    price: 1000,
    rarity: 'epic',
    icon: '🌟',
    available: true,
  },
  {
    id: 'ship-nebula-striker',
    name: 'Nebula Striker',
    description: 'Fast attack vessel from the outer rim',
    category: 'spaceship',
    price: 1500,
    rarity: 'epic',
    icon: '💫',
    available: true,
  },
  {
    id: 'ship-cosmic-phoenix',
    name: 'Cosmic Phoenix',
    description: 'Legendary vessel wreathed in stellar flames',
    category: 'spaceship',
    price: 2500,
    rarity: 'legendary',
    icon: '🌠',
    available: true,
  },
  {
    id: 'ship-void-wraith',
    name: 'Void Wraith',
    description: 'Phases through dimensions, masters dark matter',
    category: 'spaceship',
    price: 3500,
    rarity: 'legendary',
    icon: '🌑',
    available: true,
  },
];

// Boosters - consumable items
export const boosterItems: SpaceShopItem[] = [
  {
    id: 'booster-force-field-1',
    name: 'Force Field',
    description: 'Protects your streak for 1 day',
    category: 'booster',
    price: 200,
    rarity: 'common',
    icon: '🛡️',
    available: true,
    duration: 1,
    effect: 'Streak protection for 1 day',
    stackable: true,
  },
  {
    id: 'booster-force-field-3',
    name: 'Force Field Pro',
    description: 'Protects your streak for 3 days',
    category: 'booster',
    price: 500,
    rarity: 'rare',
    icon: '🛡️',
    available: true,
    duration: 3,
    effect: 'Streak protection for 3 days',
    stackable: true,
  },
  {
    id: 'booster-force-field-7',
    name: 'Force Field Ultra',
    description: 'Protects your streak for 7 days',
    category: 'booster',
    price: 1000,
    rarity: 'epic',
    icon: '🛡️',
    available: true,
    duration: 7,
    effect: 'Streak protection for 7 days',
    stackable: true,
  },
  {
    id: 'booster-warp-drive',
    name: 'Warp Drive',
    description: 'Earn 2x points for 1 day',
    category: 'booster',
    price: 300,
    rarity: 'rare',
    icon: '⚡',
    available: true,
    duration: 1,
    effect: '2x point multiplier for 1 day',
    stackable: true,
  },
  {
    id: 'booster-warp-drive-3',
    name: 'Warp Drive Extended',
    description: 'Earn 2x points for 3 days',
    category: 'booster',
    price: 750,
    rarity: 'epic',
    icon: '⚡',
    available: true,
    duration: 3,
    effect: '2x point multiplier for 3 days',
    stackable: true,
  },
  {
    id: 'booster-time-warp',
    name: 'Time Warp',
    description: 'Retry a failed exercise',
    category: 'booster',
    price: 150,
    rarity: 'common',
    icon: '⏰',
    available: true,
    effect: 'Second chance on one exercise',
    stackable: true,
  },
  {
    id: 'booster-deflector-shield',
    name: 'Deflector Shield',
    description: 'Reduce next penalty by 50%',
    category: 'booster',
    price: 250,
    rarity: 'rare',
    icon: '🔰',
    available: true,
    effect: 'Halves the next penalty received',
    stackable: true,
  },
  {
    id: 'booster-gravity-well',
    name: 'Gravity Well',
    description: 'Pull in 25% bonus points for 1 day',
    category: 'booster',
    price: 400,
    rarity: 'epic',
    icon: '🌀',
    available: true,
    duration: 1,
    effect: '25% bonus points for 1 day',
    stackable: true,
  },
];

// Celebrations - achievement animations
export const celebrationItems: SpaceShopItem[] = [
  {
    id: 'celebration-stars',
    name: 'Standard Stars',
    description: 'Classic twinkling star animation',
    category: 'celebration',
    price: 0,
    rarity: 'common',
    icon: '⭐',
    available: true,
  },
  {
    id: 'celebration-rocket-launch',
    name: 'Rocket Launch',
    description: 'Blast off with rocket effects',
    category: 'celebration',
    price: 400,
    rarity: 'rare',
    icon: '🚀',
    available: true,
  },
  {
    id: 'celebration-supernova-burst',
    name: 'Supernova Burst',
    description: 'Explosive stellar celebration',
    category: 'celebration',
    price: 600,
    rarity: 'epic',
    icon: '💥',
    available: true,
  },
  {
    id: 'celebration-constellation-form',
    name: 'Constellation Formation',
    description: 'Stars connect to form patterns',
    category: 'celebration',
    price: 800,
    rarity: 'epic',
    icon: '✨',
    available: true,
  },
  {
    id: 'celebration-wormhole',
    name: 'Wormhole Effect',
    description: 'Portal through spacetime',
    category: 'celebration',
    price: 1000,
    rarity: 'legendary',
    icon: '🌀',
    available: true,
  },
  {
    id: 'celebration-aurora',
    name: 'Aurora Borealis',
    description: 'Dancing cosmic lights',
    category: 'celebration',
    price: 1200,
    rarity: 'legendary',
    icon: '🌈',
    available: true,
  },
];

// All items combined
export const allSpaceShopItems: SpaceShopItem[] = [
  ...titleItems,
  ...frameItems,
  ...avatarItems,
  ...spaceshipItems,
  ...boosterItems,
  ...celebrationItems,
];

// Helper functions
export function getItemById(id: string): SpaceShopItem | undefined {
  return allSpaceShopItems.find(item => item.id === id);
}

export function getItemsByCategory(category: SpaceItemCategory): SpaceShopItem[] {
  return allSpaceShopItems.filter(item => item.category === category && item.available);
}

export function getItemPrice(id: string): number {
  const item = getItemById(id);
  return item?.price ?? 0;
}

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return 'text-neutral-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
  }
}

export function getRarityBorderColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return 'border-neutral-600';
    case 'rare': return 'border-blue-500/50';
    case 'epic': return 'border-purple-500/50';
    case 'legendary': return 'border-yellow-500/50';
  }
}

export function getRarityGlow(rarity: ItemRarity): string {
  switch (rarity) {
    case 'common': return '';
    case 'rare': return 'shadow-blue-500/10 shadow-md';
    case 'epic': return 'shadow-purple-500/20 shadow-lg';
    case 'legendary': return 'shadow-yellow-500/30 shadow-lg';
  }
}

// Default equipped items for new students
export const defaultEquippedItems = {
  title: null as string | null,
  frame: null as string | null,
  avatar: 'avatar-astronaut-blue',
  spaceship: 'ship-starter-shuttle',
  celebration: 'celebration-stars',
};

// Default inventory for new students (free starter items)
export const defaultInventory: string[] = [
  'avatar-astronaut-blue',
  'ship-starter-shuttle',
  'celebration-stars',
];
