import type { Category, Reward, RewardEligibility, User } from '@/data/types';

/** The four stamp categories every reward requires (Festival is bonus-only) */
export const REQUIRED_CATEGORIES: Category[] = [
  'Dining',
  'Staycation',
  'Heritage',
  'Adventure',
];

/**
 * Where a reward stands for the current user, ignoring any claim QR.
 * - ready: requirements met, can generate a claim QR
 * - locked: points and/or stamps still missing
 * - claimed: this is the reward the user claimed this promo period
 * - period-used: the user claimed a different reward this period
 * - sold-out: a limited reward with no claims left, or otherwise unavailable
 */
export type RewardStatus = 'ready' | 'locked' | 'claimed' | 'period-used' | 'sold-out';

export function isSoldOut(reward: Reward): boolean {
  return !reward.available || (reward.limited && (reward.remainingClaims ?? 0) <= 0);
}

/**
 * Single source of truth for a reward's status, shared by the list cards and
 * the detail screen so the two never disagree.
 */
export function getRewardStatus(
  reward: Reward,
  eligibility: RewardEligibility | undefined,
  user: User | undefined,
): RewardStatus {
  if (user?.hasClaimedThisPeriod) {
    return user.claimedRewardId === reward.id ? 'claimed' : 'period-used';
  }
  if (reward.claimedByUser) return 'claimed';
  if (isSoldOut(reward)) return 'sold-out';
  if (eligibility?.eligible) return 'ready';
  return 'locked';
}

/**
 * Short "what's left" line, e.g. "250 pts + Adventure stamp to go".
 * Returns null when nothing is missing.
 */
export function describeRemaining(eligibility: RewardEligibility): string | null {
  const parts: string[] = [];
  if (eligibility.pointsNeeded > 0) {
    parts.push(`${eligibility.pointsNeeded.toLocaleString('en-US')} pts`);
  }
  const missing = eligibility.missingCategories;
  if (missing.length === 1) {
    parts.push(`${missing[0]} stamp`);
  } else if (missing.length > 1) {
    parts.push(`${missing.length} stamps`);
  }
  return parts.length > 0 ? `${parts.join(' + ')} to go` : null;
}

const STATUS_RANK: Record<RewardStatus, number> = {
  claimed: 0,
  ready: 1,
  locked: 2,
  'period-used': 3,
  'sold-out': 4,
};

/** How far a locked reward is from unlocking; lower is closer */
function distanceToUnlock(eligibility: RewardEligibility) {
  // A missing stamp counts as roughly one site visit's worth of points
  return eligibility.pointsNeeded + eligibility.missingCategories.length * 150;
}

/**
 * List order: the claimed reward, then ready to claim, then locked rewards
 * closest to unlocking first, then rewards that can't be claimed (dimmed).
 */
export function compareRewards(
  a: { reward: Reward; eligibility: RewardEligibility; status: RewardStatus },
  b: { reward: Reward; eligibility: RewardEligibility; status: RewardStatus },
): number {
  const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
  if (rank !== 0) return rank;
  if (a.status === 'locked') {
    const distance = distanceToUnlock(a.eligibility) - distanceToUnlock(b.eligibility);
    if (distance !== 0) return distance;
  }
  return a.reward.pointsCost - b.reward.pointsCost;
}

/** Time left on a claim pass, "mm:ss" (rounded up, so 00:00 means expired) */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** "Mar 31, 2027" */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
