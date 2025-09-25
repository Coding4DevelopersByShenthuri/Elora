import type { UserCase } from '../UseCasesTypes';

interface IntermediateProps {
  data: UserCase;
}

const IntermediateCase = ({ data }: IntermediateProps) => {
  return (
    <div className="max-w-md mx-auto my-12 bg-white/20 backdrop-blur-sm rounded-lg p-6 shadow-sm">
      <p className="text-white uppercase font-medium text-sm mb-4">{data.ctaText}</p>
      <p className="text-xl font-medium mb-4 text-white">Build fluency with practice</p>
      <div className="space-y-3">
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full border border-white/30 flex items-center justify-center bg-blue-200/20">
            <div className="h-3 w-3 rounded-full bg-white/70"></div>
          </div>
          <p className="ml-3 text-white/60 line-through">Introduce yourself to the app</p>
        </div>
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full border border-white/30"></div>
          <p className="ml-3 text-white">Practice daily conversations</p>
        </div>
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full border border-white/30"></div>
          <p className="ml-3 text-white">Answer common questions</p>
        </div>
        <div className="flex items-center">
          <div className="h-5 w-5 rounded-full border border-white/30"></div>
          <p className="ml-3 text-white/60">Talk about your day in English</p>
        </div>
      </div>
    </div>
  );
};

export default IntermediateCase;
