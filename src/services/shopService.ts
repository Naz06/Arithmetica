import { supabase, isDemoMode } from '../lib/supabase';
import type { ShopItem } from '../types/database';

// Demo shop items
const demoShopItems: ShopItem[] = [
  {
    id: 'item-1',
    name: 'Cosmic Blue Hair',
    description: 'A stunning blue hairstyle with star sparkles',
    category: 'hair',
    price: 100,
    image_url: '/avatars/hair/cosmic-blue.png',
    rarity: 'common',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    name: 'Golden Crown',
    description: 'A majestic crown for top achievers',
    category: 'accessory',
    price: 500,
    image_url: '/avatars/accessories/golden-crown.png',
    rarity: 'legendary',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    name: 'Space Suit',
    description: 'Official Arithmetica astronaut suit',
    category: 'outfit',
    price: 300,
    image_url: '/avatars/outfits/space-suit.png',
    rarity: 'rare',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-4',
    name: 'Nebula Background',
    description: 'A beautiful nebula backdrop',
    category: 'background',
    price: 200,
    image_url: '/avatars/backgrounds/nebula.png',
    rarity: 'rare',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-5',
    name: 'Star Glasses',
    description: 'Cool star-shaped glasses',
    category: 'accessory',
    price: 75,
    image_url: '/avatars/accessories/star-glasses.png',
    rarity: 'common',
    available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-6',
    name: 'Galaxy Hair',
    description: 'Hair with swirling galaxy patterns',
    category: 'hair',
    price: 250,
    image_url: '/avatars/hair/galaxy.png',
    rarity: 'epic',
    available: true,
    created_at: new Date().toISOString(),
  },
];

// Demo purchased items per student
const demoPurchases: Record<string, string[]> = {
  'student-1': ['item-1', 'item-5'],
  'student-2': ['item-3'],
};

export const shopService = {
  // Get all available shop items
  async getShopItems(): Promise<ShopItem[]> {
    if (isDemoMode) {
      return demoShopItems.filter(item => item.available);
    }

    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('available', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching shop items:', error);
      return [];
    }

    return data;
  },

  // Get items by category
  async getItemsByCategory(category: ShopItem['category']): Promise<ShopItem[]> {
    if (isDemoMode) {
      return demoShopItems.filter(item => item.category === category && item.available);
    }

    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('category', category)
      .eq('available', true)
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching items by category:', error);
      return [];
    }

    return data;
  },

  // Get items purchased by a student
  async getPurchasedItems(studentId: string): Promise<ShopItem[]> {
    if (isDemoMode) {
      const purchasedIds = demoPurchases[studentId] || [];
      return demoShopItems.filter(item => purchasedIds.includes(item.id));
    }

    const { data, error } = await supabase
      .from('student_purchases')
      .select(`
        item:shop_items(*)
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching purchased items:', error);
      return [];
    }

    return data.map(d => d.item) as ShopItem[];
  },

  // Check if student owns an item
  async ownsItem(studentId: string, itemId: string): Promise<boolean> {
    if (isDemoMode) {
      return (demoPurchases[studentId] || []).includes(itemId);
    }

    const { data, error } = await supabase
      .from('student_purchases')
      .select('id')
      .eq('student_id', studentId)
      .eq('item_id', itemId)
      .single();

    return !error && !!data;
  },

  // Purchase an item
  async purchaseItem(studentId: string, itemId: string, currentPoints: number): Promise<{
    success: boolean;
    error?: string;
    remainingPoints?: number;
  }> {
    // Get item price
    const items = isDemoMode
      ? demoShopItems.filter(i => i.id === itemId)
      : (await supabase.from('shop_items').select('*').eq('id', itemId).single()).data;

    const item = Array.isArray(items) ? items[0] : items;

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (currentPoints < item.price) {
      return { success: false, error: 'Not enough points' };
    }

    // Check if already owned
    if (await this.ownsItem(studentId, itemId)) {
      return { success: false, error: 'You already own this item' };
    }

    if (isDemoMode) {
      if (!demoPurchases[studentId]) {
        demoPurchases[studentId] = [];
      }
      demoPurchases[studentId].push(itemId);
      return { success: true, remainingPoints: currentPoints - item.price };
    }

    // Record purchase
    const { error: purchaseError } = await supabase
      .from('student_purchases')
      .insert({
        student_id: studentId,
        item_id: itemId,
      });

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
      return { success: false, error: 'Failed to complete purchase' };
    }

    // Deduct points
    const { error: pointsError } = await supabase
      .from('students')
      .update({ total_points: currentPoints - item.price })
      .eq('id', studentId);

    if (pointsError) {
      console.error('Error deducting points:', pointsError);
      // Purchase already recorded, points update failed - might need cleanup
      return { success: true, remainingPoints: currentPoints - item.price };
    }

    return { success: true, remainingPoints: currentPoints - item.price };
  },

  // Get item by ID
  async getItemById(itemId: string): Promise<ShopItem | null> {
    if (isDemoMode) {
      return demoShopItems.find(item => item.id === itemId) || null;
    }

    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching item:', error);
      return null;
    }

    return data;
  },

  // Admin: Create a new shop item
  async createItem(item: Omit<ShopItem, 'id' | 'created_at'>): Promise<ShopItem | null> {
    if (isDemoMode) {
      const newItem: ShopItem = {
        ...item,
        id: `item-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      demoShopItems.push(newItem);
      return newItem;
    }

    const { data, error } = await supabase
      .from('shop_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating shop item:', error);
      return null;
    }

    return data;
  },

  // Admin: Update a shop item
  async updateItem(itemId: string, updates: Partial<ShopItem>): Promise<boolean> {
    if (isDemoMode) {
      const index = demoShopItems.findIndex(i => i.id === itemId);
      if (index >= 0) {
        demoShopItems[index] = { ...demoShopItems[index], ...updates };
      }
      return true;
    }

    const { error } = await supabase
      .from('shop_items')
      .update(updates)
      .eq('id', itemId);

    return !error;
  },

  // Admin: Delete a shop item
  async deleteItem(itemId: string): Promise<boolean> {
    if (isDemoMode) {
      const index = demoShopItems.findIndex(i => i.id === itemId);
      if (index >= 0) {
        demoShopItems.splice(index, 1);
      }
      return true;
    }

    const { error } = await supabase
      .from('shop_items')
      .delete()
      .eq('id', itemId);

    return !error;
  },
};
