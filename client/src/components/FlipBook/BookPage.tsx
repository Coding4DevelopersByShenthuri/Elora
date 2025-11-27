interface BookPageProps {
  content: React.ReactNode;
  isFlipping: boolean;
  isLeft?: boolean;
  zIndex?: number;
  style?: React.CSSProperties;
}

export function BookPage({ content, isFlipping, isLeft = false, zIndex = 0, style = {} }: BookPageProps) {
  return (
    <div
      className={`absolute w-1/2 h-full bg-white dark:bg-slate-900 border-2 border-teal-200 dark:border-teal-800 shadow-lg p-3 sm:p-4 md:p-6 ${
        isLeft ? 'left-0 rounded-l-lg' : 'right-0 rounded-r-lg'
      }`}
      style={{
        zIndex,
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      <div className="h-full overflow-hidden overflow-y-auto hide-scrollbar">
        {content}
      </div>
    </div>
  );
}

