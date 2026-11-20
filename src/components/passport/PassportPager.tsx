import { colors, spacing, typography } from '@/theme';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });

export interface PassportPagerPage {
  key: string;
  label: string;
  content: ReactNode;
}

interface PassportPagerProps {
  pages: PassportPagerPage[];
  /** Index of the visible page (controlled) */
  index: number;
  onIndexChange: (index: number) => void;
  testID?: string;
}

/**
 * PassportPager
 *
 * Booklet-style page tabs ("01 Identity", "02 Stamps") above a horizontally
 * swipeable set of pages. The tab indicator tracks the swipe, and the pager's
 * height follows the visible page so a short page doesn't leave empty space
 * under it (e.g. the Identity page while the Stamps page holds many stamps).
 *
 * Height handling:
 * - Each page's height is measured from an inner view wrapping its content,
 *   so a page wrapper stretched to the tallest page can't inflate it
 * - While swiping, the height interpolates between the two pages' heights
 * - At rest, a plain style also pins the height to the active page, so the
 *   pager ends up the right size even if the animated style isn't applied
 *
 * Pages run edge to edge (the pager cancels the screen's side padding) so the
 * booklet shadows aren't clipped while swiping.
 */
export function PassportPager({ pages, index, onIndexChange, testID }: PassportPagerProps) {
  const [pageWidth, setPageWidth] = useState(0);
  const [tabWidth, setTabWidth] = useState(0);
  // Measured content height of each page (0 = not measured yet)
  const [pageHeights, setPageHeights] = useState<number[]>(() => pages.map(() => 0));
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const positioned = useRef(false);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x);
    },
  });

  // Jump to the initial page without animation once the pages are laid out
  const handleContentSizeChange = (contentWidth: number) => {
    if (positioned.current || pageWidth === 0 || contentWidth < pageWidth * pages.length) return;
    positioned.current = true;
    scrollRef.current?.scrollTo({ x: index * pageWidth, animated: false });
    scrollX.set(index * pageWidth);
  };

  // Follow later index changes (tab presses, programmatic switches)
  useEffect(() => {
    if (!positioned.current || pageWidth === 0) return;
    scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  }, [index, pageWidth, scrollRef]);

  const handleMomentumEnd = (x: number) => {
    if (pageWidth === 0) return;
    const next = Math.round(x / pageWidth);
    if (next !== index) onIndexChange(next);
  };

  const setPageHeight = (pageIndex: number, height: number) => {
    setPageHeights((current) =>
      current[pageIndex] === height ? current : current.map((h, i) => (i === pageIndex ? height : h)),
    );
  };

  // No inline callbacks (.some/.map) in this worklet: the React Compiler hoists
  // them out as plain JS functions, which can't be called on the UI thread.
  const pagerStyle = useAnimatedStyle(() => {
    if (pageWidth === 0) return {};
    const offsets: number[] = [];
    for (let i = 0; i < pageHeights.length; i++) {
      if (pageHeights[i] === 0) return {};
      offsets.push(i * pageWidth);
    }
    return {
      height: interpolate(scrollX.get(), offsets, pageHeights, Extrapolation.CLAMP),
    };
  });

  // Resting height: the active page's own height (fallback under the animated style)
  const activeHeight = pageHeights[index] ?? 0;
  const restingStyle = activeHeight > 0 ? { height: activeHeight } : null;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: pageWidth === 0 ? index * tabWidth : (scrollX.get() / pageWidth) * tabWidth,
      },
    ],
  }));

  return (
    <View testID={testID}>
      {/* Page tabs */}
      <View
        style={styles.tabs}
        accessibilityRole="tablist"
        onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / pages.length)}
      >
        {pages.map((page, i) => {
          const selected = i === index;
          return (
            <Pressable
              key={page.key}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
              onPress={() => onIndexChange(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={page.label}
              testID={testID ? `${testID}-tab-${page.key}` : undefined}
            >
              <Text style={[styles.tabNumber, selected && styles.tabNumberActive]}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{page.label}</Text>
            </Pressable>
          );
        })}
        {tabWidth > 0 && (
          <Animated.View style={[styles.indicator, { width: tabWidth }, indicatorStyle]}>
            <View style={styles.indicatorBar} />
          </Animated.View>
        )}
      </View>

      {/* Pages */}
      <View style={styles.bleed} onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}>
        {pageWidth > 0 && (
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={handleContentSizeChange}
            onMomentumScrollEnd={(e) => handleMomentumEnd(e.nativeEvent.contentOffset.x)}
            contentContainerStyle={styles.pagesContent}
            style={[restingStyle, pagerStyle]}
          >
            {pages.map((page, i) => (
              <View
                key={page.key}
                style={{ width: pageWidth }}
                accessibilityElementsHidden={i !== index}
                importantForAccessibility={i === index ? 'auto' : 'no-hide-descendants'}
              >
                {/* Measured instead of the wrapper: its height is always its content's */}
                <View
                  style={styles.page}
                  onLayout={(e) => setPageHeight(i, e.nativeEvent.layout.height)}
                >
                  {page.content}
                </View>
              </View>
            ))}
          </Animated.ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.passportPaperBorder,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  tabPressed: {
    opacity: 0.6,
  },
  tabNumber: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    opacity: 0.6,
  },
  tabNumberActive: {
    color: colors.accent,
    opacity: 1,
  },
  tabLabel: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabLabelActive: {
    fontFamily: 'Inter_700Bold',
    color: colors.passportLeather,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: -1,
    height: 3,
  },
  indicatorBar: {
    flex: 1,
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },

  bleed: {
    marginHorizontal: -spacing.base,
  },
  pagesContent: {
    alignItems: 'flex-start',
  },
  page: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
  },
});
