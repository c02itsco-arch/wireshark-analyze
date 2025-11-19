
import React, { useState, useCallback } from 'react';
import { GraphData, AnalysisResult } from './types';
import { analyzePcapData } from './services/geminiService';
import FileUploadZone from './components/FileUploadZone';
import GraphDisplay from './components/GraphDisplay';
import AnalysisPanel from './components/AnalysisPanel';
import Loader from './components/Loader';
import { ShieldCheckIcon } from './components/icons/ShieldCheckIcon';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setGraphData(null);
    setAnalysisSummary(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGraphData(null);
    setAnalysisSummary(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target?.result as string;
        if (!csvData) {
          throw new Error('Could not read file content.');
        }

        // Limit data sent to Gemini to avoid exceeding token limits, e.g., first 500 lines
        const csvLines = csvData.split('\n');
        const header = csvLines[0];
        const truncatedData = [header, ...csvLines.slice(1, 501)].join('\n');


        const result: AnalysisResult = await analyzePcapData(truncatedData);
        
        setAnalysisSummary(result.analysisSummary);
        setGraphData(result.graphData);
      } catch (err) {
        console.error('Analysis failed:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  }, [file]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <header className="flex items-center space-x-4 mb-8">
          <ShieldCheckIcon className="h-10 w-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Cyber Threat Visualizer</h1>
            <p className="text-gray-400">AI-Powered Network Analysis</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">1. Upload Data</h2>
              <FileUploadZone onFileChange={handleFileChange} />
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">2. Start Analysis</h2>
              <button
                onClick={handleAnalyze}
                disabled={!file || isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Network Traffic'}
              </button>
            </div>
            
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {analysisSummary && !isLoading && (
              <div className="sticky top-8">
                <AnalysisPanel summary={analysisSummary} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-8 xl:col-span-9 bg-gray-800/50 rounded-lg p-2 border border-gray-700 min-h-[400px] lg:min-h-[calc(100vh-10rem)] flex items-center justify-center">
            {isLoading && <Loader />}
            {!isLoading && !graphData && (
              <div className="text-center text-gray-500">
                <ShieldCheckIcon className="h-24 w-24 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold">Visualization Panel</h3>
                <p>Upload a CSV file and click "Analyze" to see the threat graph.</p>
              </div>
            )}
            {graphData && <GraphDisplay data={graphData} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
