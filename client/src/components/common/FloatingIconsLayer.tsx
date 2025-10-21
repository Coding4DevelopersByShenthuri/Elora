import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const location = useLocation();
  
  // Don't render floating icons on the Kids page
  if (location.pathname === '/kids') {
    return null;
  }
  
  // Precompute randomized positions and animation timing for a stable render per mount
  const items = useMemo(() => {
    const viewCount = 12; // Reduced for minimalistic effect
    return Array.from({ length: viewCount }).map((_, idx) => {
      const Icon = icons[idx % icons.length];
      const top = randomBetween(5, 85); // percent
      const left = randomBetween(2, 98); // percent
      const delay = randomBetween(0, 8); // seconds - increased for less density
      const duration = randomBetween(18, 35); // seconds - slower for subtlety
      const size = randomBetween(12, 18); // px - smaller icons
      const rotate = randomBetween(-8, 8); // deg - less rotation
      const color = tealPalette[idx % tealPalette.length];
      const floatDistance = randomBetween(8, 15); // px - reduced movement
      return { Icon, top, left, delay, duration, size, rotate, color, floatDistance };
    });
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
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
            opacity: theme === 'dark' ? 0.12 : 0.18,
          }}
        >
          <item.Icon size={item.size} color={item.color} />
        </div>
      ))}

      <style>{`
        @keyframes floatingDrift {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.15; }
          25% { transform: translate3d(4px, -${Math.round(items[0]?.floatDistance ?? 12)}px, 0) rotate(1deg); opacity: 0.22; }
          50% { transform: translate3d(-3px, -${Math.round((items[0]?.floatDistance ?? 12) / 2)}px, 0) rotate(-0.8deg); opacity: 0.18; }
          75% { transform: translate3d(5px, -${Math.round(items[0]?.floatDistance ?? 12)}px, 0) rotate(0.5deg); opacity: 0.20; }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
};

export default FloatingIconsLayer;


