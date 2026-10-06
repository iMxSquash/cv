/**
 * A full stop in the palette gradient. With the WebGL scene running and motion
 * allowed it turns invisible, keeping its room in the line: the orb lands on it
 * instead (src/components/scroll/orbDirector.ts). `isFollowed` lets the orb trail
 * claim it on its own; off, a section's motion decides when the orb comes.
 */
export function OrbAnchor({ isFollowed = true }: { isFollowed?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-orb-anchor
      data-orb-follow={isFollowed ? "" : undefined}
      className="orb-dot ml-[0.04em] inline-block size-[0.2em] rounded-full pinned:in-data-[webgl=ready]:invisible"
    />
  );
}
