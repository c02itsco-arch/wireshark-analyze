
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
      <p className="text-lg text-gray-400">Analyzing data with Gemini...</p>
    </div>
  );
};

export default Loader;
