import type { ReactNode, FormEvent } from 'react';

interface GlassFormProps {
  title?: string;
  description?: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

const GlassForm = ({ title, description, onSubmit, children }: GlassFormProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        {title && (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-teal-600 mb-6">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="backdrop-blur-md bg-white/40 dark:bg-white/10 space-y-6 p-8 md:p-10 rounded-xl border border-gray-300/40 dark:border-white/10 shadow-xl transition-all duration-300 hover:shadow-2xl"
      >
        {children}
      </form>
    </div>
  );
};

export default GlassForm;
