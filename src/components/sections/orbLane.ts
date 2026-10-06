/**
 * The orb drifts down the right of the about text, from `fromY` to `toY`
 * (shares of the viewport); the experiences pick it up at the end of that lane
 * to stretch it into their panels. Shared so the hand-over does not jump.
 */
export const ORB_LANE = { x: 0.8, fromY: 0.3, toY: 0.7 };
