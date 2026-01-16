import React, { CSSProperties, useMemo } from 'react';
import { useVirtualList } from '../hooks/useVirtualList';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VirtualScrollingListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  overscan?: number;
  estimatedItemHeight?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
}

export const VirtualScrollingList = <T, any>({
  items,
  renderItem,
  itemHeight = 80,
  overscan = 5,
  estimatedItemHeight = 80,
  loading = false,
  loadingComponent,
  headerComponent,
}: VirtualScrollingListProps<T>) => {
  const {
    getVisibleRange,
    scrollToIndex,
    containerRef,
  } = useVirtualList({
    items,
    itemHeight,
    overscan,
    estimatedItemHeight,
  });

  const { scrollTop } = getVisibleRange();

  const handleScrollTo = useCallback((direction: 'up' | 'down') => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { itemHeight, estimatedItemHeight } = props;
    const { scrollTop: currentScrollTop } = getVisibleRange();
    const { viewportHeight } = getVisibleRange().viewportHeight;

    let targetScrollTop: number;

    if (direction === 'up') {
      targetScrollTop = Math.max(0, currentScrollTop - viewportHeight);
    } else if (direction === 'down') {
      targetScrollTop = Math.min(container.scrollHeight - viewportHeight, currentScrollTop + viewportHeight);
    }

    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  }, [getVisibleRange, items, itemHeight, estimatedItemHeight, containerRef]);

  return (
    <div className="virtual-scrolling-list">
      {headerComponent}

      {loading && (
        <div className="loading-overlay">
          {loadingComponent}
        </div>
      )}

      <div
        ref={containerRef}
        className="virtual-list-container"
        style={{
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        <div
          className="virtual-spacer"
          style={{ height: (scrollTop.start) * estimatedItemHeight }}
        />

        <div className="virtual-items">
          {getVisibleRange().map(index => {
            const item = items[index];
            return renderItem(item, index);
          })}
        </div>
      </div>

      <div
        className="scroll-controls"
        onClick={() => handleScrollTo('up')}
      >
        <ChevronUp className="w-8 h-8 text-neutral-400 hover:text-neutral-200 cursor-pointer" />
      </div>

      <div
        className="scroll-controls"
        onClick={() => handleScrollTo('down')}
      >
        <ChevronDown className="w-8 h-8 text-neutral-400 hover:text-neutral-200 cursor-pointer" />
      </div>
    </div>
  );
}
