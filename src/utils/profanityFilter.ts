// Profanity Filter for Usernames
// This is a basic filter - in production, consider using a more comprehensive library

// Common profanity words (basic list - expand as needed)
const PROFANITY_LIST = [
  'ass', 'arse', 'bastard', 'bitch', 'bollocks', 'bugger', 'crap', 'cunt',
  'damn', 'dick', 'fag', 'faggot', 'fuck', 'fucked', 'fucker', 'fucking',
  'hell', 'homo', 'jerk', 'nigger', 'piss', 'prick', 'pussy', 'retard',
  'shit', 'shite', 'slut', 'twat', 'wanker', 'whore',
  // Variations with numbers/symbols
  'a55', 'b1tch', 'd1ck', 'f4ck', 'f4g', 'sh1t', 'b!tch',
];

// Reserved words that shouldn't be used as usernames
const RESERVED_WORDS = [
  'admin', 'administrator', 'tutor', 'teacher', 'staff', 'moderator', 'mod',
  'stellar', 'system', 'support', 'help', 'null', 'undefined', 'anonymous',
];

// Minimum and maximum username lengths
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

// Allowed characters pattern (alphanumeric, underscores, hyphens)
const ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9_-]+$/;

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Check if a string contains profanity
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Direct match
  for (const word of PROFANITY_LIST) {
    if (lowerText.includes(word)) {
      return true;
    }
  }

  // Check with common letter substitutions
  const substituted = lowerText
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i');

  for (const word of PROFANITY_LIST) {
    if (substituted.includes(word)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a username is a reserved word
 */
export function isReservedWord(username: string): boolean {
  return RESERVED_WORDS.includes(username.toLowerCase());
}

/**
 * Validate a username for the leaderboard
 */
export function validateUsername(username: string): UsernameValidationResult {
  // Trim whitespace
  const trimmed = username.trim();

  // Check if empty
  if (!trimmed) {
    return { isValid: false, error: 'Username cannot be empty' };
  }

  // Check minimum length
  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters`
    };
  }

  // Check maximum length
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`
    };
  }

  // Check allowed characters
  if (!ALLOWED_CHARS_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens'
    };
  }

  // Check for profanity
  if (containsProfanity(trimmed)) {
    return {
      isValid: false,
      error: 'Username contains inappropriate language. Please choose another.'
    };
  }

  // Check reserved words
  if (isReservedWord(trimmed)) {
    return {
      isValid: false,
      error: 'This username is reserved. Please choose another.'
    };
  }

  return { isValid: true };
}

/**
 * Generate a random anonymous username for display
 */
export function generateAnonymousUsername(): string {
  const adjectives = [
    'Cosmic', 'Stellar', 'Lunar', 'Solar', 'Astral', 'Nebula', 'Orbit',
    'Galactic', 'Meteor', 'Comet', 'Nova', 'Pulsar', 'Quasar', 'Star',
  ];
  const nouns = [
    'Explorer', 'Voyager', 'Pioneer', 'Cadet', 'Ranger', 'Scout',
    'Navigator', 'Pilot', 'Astronaut', 'Scientist', 'Scholar', 'Learner',
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999) + 1;

  return `${adj}${noun}${num}`;
}

/**
 * Mask a name for privacy (e.g., "John Smith" -> "J***n S***h")
 */
export function maskName(name: string): string {
  return name.split(' ').map(part => {
    if (part.length <= 2) return part[0] + '*';
    return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
  }).join(' ');
}
