import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import {
  Rocket,
  Star,
  Shield,
  Zap,
  Crown,
  Sparkles,
  Package,
  CheckCircle,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { StudentProfile, EquippedItems, ActiveBooster } from '../../types';
import {
  SpaceShopItem,
  SpaceItemCategory,
  getItemById,
  getItemsByCategory,
  getRarityColor,
  getRarityBorderColor,
  getRarityGlow,
  defaultEquippedItems,
  defaultInventory,
} from '../../data/spaceShopItems';

interface CommandCenterProps {
  student: StudentProfile;
  onPurchaseItem: (itemId: string, price: number) => void;
  onEquipItem: (category: SpaceItemCategory, itemId: string | null) => void;
  onActivateBooster: (itemId: string) => void;
}

interface CommandCenterPreviewProps {
  student: StudentProfile;
  onClick: () => void;
}

// Get the current equipped items, with defaults
function getEquipped(student: StudentProfile): EquippedItems {
  return student.equippedItems || {
    title: defaultEquippedItems.title,
    frame: defaultEquippedItems.frame,
    avatar: defaultEquippedItems.avatar,
    spaceship: defaultEquippedItems.spaceship,
    celebration: defaultEquippedItems.celebration,
  };
}

// Get student inventory with defaults
function getInventory(student: StudentProfile): string[] {
  return student.inventory || [...defaultInventory];
}

// Check if booster is still active
function isBoosterActive(booster: ActiveBooster): boolean {
  if (booster.used) return false;
  if (!booster.expiresAt) return true;
  return new Date(booster.expiresAt) > new Date();
}

// Get active boosters
function getActiveBoosters(student: StudentProfile): ActiveBooster[] {
  return (student.activeBoosters || []).filter(isBoosterActive);
}

// Compact preview card for dashboard
export const CommandCenterPreview: React.FC<CommandCenterPreviewProps> = ({
  student,
  onClick,
}) => {
  const equipped = getEquipped(student);
  const inventory = getInventory(student);
  const activeBoosters = getActiveBoosters(student);

  const titleItem = equipped.title ? getItemById(equipped.title) : null;
  const avatarItem = equipped.avatar ? getItemById(equipped.avatar) : null;
  const frameItem = equipped.frame ? getItemById(equipped.frame) : null;

  return (
    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-400">
          <Rocket className="w-5 h-5" />
          Command Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Look Preview */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-3xl border-2 ${
            frameItem ? getRarityBorderColor(frameItem.rarity) : 'border-neutral-700'
          } ${frameItem ? getRarityGlow(frameItem.rarity) : ''}`}>
            {avatarItem?.icon || '👨‍🚀'}
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-400">Your Look</p>
            <p className="font-medium text-neutral-100">
              {titleItem ? (
                <span className={getRarityColor(titleItem.rarity)}>
                  {titleItem.icon} {titleItem.name}
                </span>
              ) : (
                <span className="text-neutral-500">No title equipped</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-neutral-800/50 rounded-lg text-center">
            <Package className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-100">{inventory.length}</p>
            <p className="text-xs text-neutral-500">Items</p>
          </div>
          <div className="p-2 bg-neutral-800/50 rounded-lg text-center">
            <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-neutral-100">{activeBoosters.length}</p>
            <p className="text-xs text-neutral-500">Active</p>
          </div>
        </div>

        {/* Active Boosters Preview */}
        {activeBoosters.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Shield className="w-3 h-3" />
              <span className="font-medium">Active: {activeBoosters.map(b => {
                const item = getItemById(b.itemId);
                return item?.name;
              }).join(', ')}</span>
            </div>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={onClick}
          icon={<Rocket className="w-4 h-4" />}
        >
          Open Command Center
        </Button>
      </CardContent>
    </Card>
  );
};

// Full Command Center component
export const CommandCenter: React.FC<CommandCenterProps> = ({
  student,
  onPurchaseItem,
  onEquipItem,
  onActivateBooster,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SpaceItemCategory>('title');
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState<SpaceShopItem | null>(null);

  const equipped = getEquipped(student);
  const inventory = getInventory(student);
  const activeBoosters = getActiveBoosters(student);

  const ownsItem = (itemId: string) => inventory.includes(itemId);

  const canAfford = (price: number) => student.points >= price;

  const isEquipped = (category: SpaceItemCategory, itemId: string) => {
    switch (category) {
      case 'title': return equipped.title === itemId;
      case 'frame': return equipped.frame === itemId;
      case 'avatar': return equipped.avatar === itemId;
      case 'spaceship': return equipped.spaceship === itemId;
      case 'celebration': return equipped.celebration === itemId;
      default: return false;
    }
  };

  const handleItemClick = (item: SpaceShopItem) => {
    if (ownsItem(item.id)) {
      // Equip/unequip the item
      if (item.category === 'booster') {
        onActivateBooster(item.id);
      } else {
        const currentlyEquipped = isEquipped(item.category, item.id);
        if (currentlyEquipped && (item.category === 'title' || item.category === 'frame')) {
          // Can unequip titles and frames
          onEquipItem(item.category, null);
        } else {
          onEquipItem(item.category, item.id);
        }
      }
    } else if (item.price > 0) {
      // Show purchase confirmation
      setShowPurchaseConfirm(item);
    }
  };

  const handlePurchase = () => {
    if (showPurchaseConfirm && canAfford(showPurchaseConfirm.price)) {
      onPurchaseItem(showPurchaseConfirm.id, showPurchaseConfirm.price);
      setShowPurchaseConfirm(null);
    }
  };

  const renderItem = (item: SpaceShopItem) => {
    const owned = ownsItem(item.id);
    const affordable = canAfford(item.price);
    const equipped = isEquipped(item.category, item.id);
    const isFree = item.price === 0;

    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`p-4 rounded-xl border cursor-pointer transition-all ${getRarityGlow(item.rarity)} ${
          equipped
            ? 'bg-primary-500/20 border-primary-500/50 ring-2 ring-primary-500/30'
            : owned
            ? `bg-neutral-800/70 ${getRarityBorderColor(item.rarity)} hover:bg-neutral-800`
            : affordable || isFree
            ? `bg-neutral-800/30 ${getRarityBorderColor(item.rarity)} hover:bg-neutral-800/50`
            : 'bg-neutral-900/50 border-neutral-800 opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">{item.icon}</div>
          <p className="font-medium text-sm text-neutral-100 truncate">{item.name}</p>
          <p className={`text-xs capitalize ${getRarityColor(item.rarity)}`}>
            {item.rarity}
          </p>
          {item.description && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.description}</p>
          )}

          {/* Status/Action */}
          <div className="mt-2">
            {equipped ? (
              <Badge variant="success" size="sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Equipped
              </Badge>
            ) : owned ? (
              <Badge variant="info" size="sm">Tap to Equip</Badge>
            ) : isFree ? (
              <Badge variant="success" size="sm">Free</Badge>
            ) : (
              <span className={`text-sm font-bold ${affordable ? 'text-yellow-400' : 'text-neutral-500'}`}>
                <Star className="w-3 h-3 inline mr-1" />
                {item.price} pts
              </span>
            )}
          </div>

          {/* Booster-specific info */}
          {item.category === 'booster' && item.effect && (
            <p className="text-xs text-primary-400 mt-1">{item.effect}</p>
          )}
        </div>
      </div>
    );
  };

  const categoryConfig: Record<SpaceItemCategory, { label: string; icon: React.ReactNode }> = {
    title: { label: 'Titles', icon: <Crown className="w-4 h-4" /> },
    frame: { label: 'Frames', icon: <Sparkles className="w-4 h-4" /> },
    avatar: { label: 'Avatars', icon: <Star className="w-4 h-4" /> },
    spaceship: { label: 'Ships', icon: <Rocket className="w-4 h-4" /> },
    booster: { label: 'Boosters', icon: <Zap className="w-4 h-4" /> },
    celebration: { label: 'Effects', icon: <Sparkles className="w-4 h-4" /> },
  };

  return (
    <div className="space-y-6">
      {/* Header with current status */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          {/* Avatar preview */}
          <div className={`w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center text-4xl border-3 ${
            equipped.frame ? getRarityBorderColor(getItemById(equipped.frame)?.rarity || 'common') : 'border-neutral-700'
          } ${equipped.frame ? getRarityGlow(getItemById(equipped.frame)?.rarity || 'common') : ''}`}>
            {getItemById(equipped.avatar)?.icon || '👨‍🚀'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {equipped.title ? (
                <span className={`font-bold ${getRarityColor(getItemById(equipped.title)?.rarity || 'common')}`}>
                  {getItemById(equipped.title)?.icon} {getItemById(equipped.title)?.name}
                </span>
              ) : (
                <span className="text-neutral-500">No title equipped</span>
              )}
            </div>
            <p className="text-sm text-neutral-400">
              Ship: {getItemById(equipped.spaceship)?.icon} {getItemById(equipped.spaceship)?.name || 'Starter Shuttle'}
            </p>
            <p className="text-sm text-neutral-400">
              Effect: {getItemById(equipped.celebration)?.icon} {getItemById(equipped.celebration)?.name || 'Standard Stars'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-xl font-bold text-yellow-400">
            <Star className="w-5 h-5" />
            {student.points} pts
          </div>
          <p className="text-xs text-neutral-500 mt-1">{inventory.length} items owned</p>
        </div>
      </div>

      {/* Active Boosters */}
      {activeBoosters.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Active Boosters
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeBoosters.map(booster => {
              const item = getItemById(booster.itemId);
              const timeLeft = booster.expiresAt
                ? Math.max(0, Math.ceil((new Date(booster.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
                : null;

              return (
                <div key={booster.id} className="p-2 bg-yellow-500/10 rounded-lg flex items-center gap-2">
                  <span className="text-xl">{item?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-100 truncate">{item?.name}</p>
                    {timeLeft !== null && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeLeft}h left
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs
        tabs={Object.entries(categoryConfig).map(([category, config]) => ({
          id: category,
          label: (
            <span className="flex items-center gap-1">
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
            </span>
          ),
          content: (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {getItemsByCategory(category as SpaceItemCategory).map(renderItem)}
            </div>
          ),
        }))}
        defaultTab="title"
      />

      {/* Purchase Confirmation Modal */}
      <Modal
        isOpen={!!showPurchaseConfirm}
        onClose={() => setShowPurchaseConfirm(null)}
        title="Confirm Purchase"
        size="sm"
      >
        {showPurchaseConfirm && (
          <div className="text-center space-y-4">
            <div className="text-6xl">{showPurchaseConfirm.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-neutral-100">{showPurchaseConfirm.name}</h3>
              <p className={`text-sm capitalize ${getRarityColor(showPurchaseConfirm.rarity)}`}>
                {showPurchaseConfirm.rarity}
              </p>
              <p className="text-sm text-neutral-400 mt-2">{showPurchaseConfirm.description}</p>
            </div>
            <div className="p-4 bg-neutral-800/50 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Price:</span>
                <span className="font-bold text-yellow-400">
                  <Star className="w-4 h-4 inline mr-1" />
                  {showPurchaseConfirm.price} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-neutral-400">Your Balance:</span>
                <span className={`font-bold ${canAfford(showPurchaseConfirm.price) ? 'text-green-400' : 'text-red-400'}`}>
                  {student.points} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-neutral-700">
                <span className="text-neutral-400">After Purchase:</span>
                <span className="font-bold text-neutral-100">
                  {student.points - showPurchaseConfirm.price} pts
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowPurchaseConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handlePurchase}
                disabled={!canAfford(showPurchaseConfirm.price)}
                icon={<ShoppingBag className="w-4 h-4" />}
              >
                Buy Now
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommandCenter;
