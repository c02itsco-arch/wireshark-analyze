
import React from 'react';

interface AnalysisPanelProps {
  summary: string;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ summary }) => {
  // A very basic markdown to HTML converter for demonstration
  const formatSummary = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-cyan-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-cyan-400 mt-6 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-cyan-400 mt-6 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-900 text-yellow-300 px-1.5 py-0.5 rounded-md text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />');
    
    // Wrap list items in <ul>
    html = html.replace(/(<li.*<\/li>)/gs, '<ul>$1</ul>').replace(/<\/ul><br \/><ul>/g, '');

    return { __html: html };
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 max-h-[calc(100vh-18rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Analysis Summary</h2>
      <div 
        className="prose prose-invert prose-sm text-gray-300 space-y-4"
        dangerouslySetInnerHTML={formatSummary(summary)}
      />
    </div>
  );
};

export default AnalysisPanel;
