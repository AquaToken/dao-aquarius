import { keyframes, css } from 'styled-components';

/* -------------------------------------------------------------------------- */
/*                               Keyframe Sets                                */
/* -------------------------------------------------------------------------- */

/**
 * Fade + slide-up animation.
 * Commonly used for smooth element appearance from below.
 */
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Subtle fade-in with scale effect.
 * Creates a gentle “pop” appearance.
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Flip-in animation with slight 3D rotation.
 * Good for cards or blocks that “flip” into view.
 */
export const flipIn = keyframes`
  from {
    opacity: 0;
    transform: rotateX(-15deg) scale(0.95);
  }
  to {
    opacity: 1;
    transform: rotateX(0deg) scale(1);
  }
`;

/**
 * Smooth upward motion with a small overshoot for a “springy” feel.
 * Perfect for content sections or FAQ items.
 */
export const slideUpSoft = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  60% {
    opacity: 1;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Simple fade-in with no movement.
 * Ideal for subtle hero-section animations.
 */
export const fadeAppear = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/**
 * Gentle pulsing (scaling) effect.
 * Commonly used for logos or key icons.
 */
export const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
`;

/* -------------------------------------------------------------------------- */
/*                              Animation Presets                             */
/* -------------------------------------------------------------------------- */

/**
 * Standard fade-in-up animation.
 * Duration: 0.8s, easing: ease-out, keeps final state.
 */
export const fadeInUpAnimation = css`
    animation: ${fadeInUp} 0.6s ease-out both;
`;

/**
 * Fade-in-up animation with a slight delay.
 * Ideal for staggered sequences.
 */
export const fadeInUpDelayed = css`
    animation: ${fadeInUp} 1s ease-out both;
    animation-delay: 0.2s;
`;

/**
 * Fade-in combined with a scaling effect.
 * Often used for logos, icons, or images.
 */
export const fadeInScale = css`
    animation: ${fadeIn} 0.8s ease-out both;
    animation-delay: 0.4s;
`;

/**
 * 3D flip-in animation for interactive elements.
 */
export const flipInAnimation = css`
    animation: ${flipIn} 0.6s ease-out both;
`;

/**
 * Soft, slightly bouncy slide-up animation.
 * Great for text blocks or section transitions.
 */
export const slideUpSoftAnimation = css`
    animation: ${slideUpSoft} 0.7s cubic-bezier(0.25, 1, 0.5, 1) both;
`;

/**
 * Subtle fade-in for hero and static sections.
 * Doesn’t hide content (safe for SSR and initial render).
 */
export const fadeAppearAnimation = css`
    animation: ${fadeAppear} 1s ease-out both;
`;

/**
 * Infinite gentle pulsing — gives "breathing" motion.
 */
export const pulseAnimation = css`
    animation: ${pulse} 3.5s ease-in-out infinite;
`;

/* -------------------------------------------------------------------------- */
/*                            Container Animations                            */
/* -------------------------------------------------------------------------- */

/**
 * Base style for scroll-animated containers.
 * Starts hidden (opacity: 0, translateY(40px)).
 * Fades in smoothly when `$visible` is true.
 */
export const containerScrollAnimation = css<{ $visible: boolean }>`
    opacity: 0;
    transform: translateY(4rem);
    transition: opacity 0.6s ease-out, transform 0.8s ease-out;

    ${({ $visible }) =>
        $visible &&
        css`
            opacity: 1;
            transform: translateY(0);
        `}
`;
