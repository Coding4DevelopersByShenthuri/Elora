import type { UserCase } from '../UseCasesTypes';

interface DevelopersProps {
  data: UserCase;
}

const DevelopersCase = ({ data }: DevelopersProps) => {
  return (
    <div className="max-w-3xl mx-auto my-12">
      <div className="bg-[#121416] text-white rounded-lg p-4 mt-4">
        {/* Search bar simulation */}
        <div className="flex items-center border-b border-gray-700 pb-3 mb-3">
          <div className="text-gray-300 italic flex-1">Ask me anything in English...</div>
          <div className="text-gray-300">🎤</div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Speaking Practice */}
          <div className="bg-[#1c1e20] rounded p-3">
            <div className="flex items-center mb-2">
              <div className="size-4 rounded-full bg-teal-400 mr-2"></div>
              <span className="text-sm text-white">Speaking</span>
            </div>
            <p className="text-xs text-gray-300">Daily conversation practice</p>
          </div>

          {/* Vocabulary Builder */}
          <div className="bg-[#1c1e20] rounded p-3">
            <p className="bg-gray-700 text-xs text-white inline-block px-1 rounded mb-1">Word of the Day</p>
            <div className="h-12 flex items-center justify-center text-sm text-blue-300">
              “Serendipity”
            </div>
          </div>

          {/* Offline AI */}
          <div className="bg-[#1c1e20] rounded p-3 flex flex-col items-center justify-center">
            <div className="size-10 rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-2"></div>
            <p className="text-xs text-gray-300">Runs Offline</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopersCase;
