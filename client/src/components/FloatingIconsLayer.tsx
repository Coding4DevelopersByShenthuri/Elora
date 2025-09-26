import React, { useMemo } from 'react';

// Material Design
import { MdSchool, MdOutlineAppShortcut, MdOutlineLeaderboard } from 'react-icons/md';
// FontAwesome
import { FaBookOpen, FaMicrophoneAlt, FaShieldAlt, FaRegStar } from 'react-icons/fa';
// Game Icons
import { GiTeacher, GiPodiumWinner } from 'react-icons/gi';
// Remix Icons
import { RiGraduationCapLine, RiWifiOffLine } from 'react-icons/ri';
// Heroicons v2
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
// Bootstrap Icons
import { BsSoundwave } from 'react-icons/bs';
// Tabler Icons
import { TbLanguage } from 'react-icons/tb';
// Ant Design Icons
import { AiOutlineLaptop } from 'react-icons/ai';
// Ionicons v5
import { IoTrophyOutline } from 'react-icons/io5';


const tealPalette = [
  'hsl(178 80% 42%)',
  'hsl(180 84% 40%)',
  'hsl(180 94% 50%)',
  'hsl(178 80% 60%)',
  'hsl(180 84% 30%)',
];

const icons = [
  MdSchool,
  FaBookOpen,
  GiTeacher,
  RiGraduationCapLine,
  FaMicrophoneAlt,
  HiChatBubbleLeftRight,
  BsSoundwave,
  TbLanguage,
  MdOutlineAppShortcut,
  AiOutlineLaptop,
  RiWifiOffLine,
  FaShieldAlt,
  FaRegStar,
  MdOutlineLeaderboard,
  GiPodiumWinner,
  IoTrophyOutline,
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const FloatingIconsLayer: React.FC = () => {
  // Precompute randomized positions and animation timing for a stable render per mount
  const items = useMemo(() => {
    const viewCount = 18; // render a few extras for density
    return Array.from({ length: viewCount }).map((_, idx) => {
      const Icon = icons[idx % icons.length];
      const top = randomBetween(5, 85); // percent
      const left = randomBetween(2, 98); // percent
      const delay = randomBetween(0, 6); // seconds
      const duration = randomBetween(12, 28); // seconds
      const size = randomBetween(14, 22); // px small
      const rotate = randomBetween(-15, 15); // deg
      const color = tealPalette[idx % tealPalette.length];
      const floatDistance = randomBetween(12, 28); // px
      return { Icon, top, left, delay, duration, size, rotate, color, floatDistance };
    });
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 light:block dark:hidden"
      style={{ contain: 'layout style', isolation: 'isolate' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="floating-icon absolute"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            animation: `floatingDrift ${item.duration}s ease-in-out ${item.delay}s infinite`,
            willChange: 'transform, opacity',
            transform: `rotate(${item.rotate}deg)`,
            opacity: 0.35,
          }}
        >
          <item.Icon size={item.size} color={item.color} />
        </div>
      ))}

      <style>{`
        @keyframes floatingDrift {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.25; }
          25% { transform: translate3d(8px, -${Math.round(items[0]?.floatDistance ?? 20)}px, 0) rotate(2deg); opacity: 0.4; }
          50% { transform: translate3d(-6px, -${Math.round((items[0]?.floatDistance ?? 20) / 2)}px, 0) rotate(-1.5deg); opacity: 0.32; }
          75% { transform: translate3d(10px, -${Math.round(items[0]?.floatDistance ?? 20)}px, 0) rotate(1deg); opacity: 0.42; }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
};

export default FloatingIconsLayer;


