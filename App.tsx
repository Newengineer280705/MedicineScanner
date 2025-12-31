import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScanButton } from './components/ScanButton';
import { ResultCard } from './components/ResultCard';
import { Loading } from './components/Loading';
import { CameraView } from './components/CameraView';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { AIAssistant } from './components/AIAssistant';
import { analyzeMedicineImage } from './services/geminiService';
import { AppState, MedicineData, Theme, Language } from './types';
import { AlertCircle } from 'lucide-react';
import { translations } from './translations';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<MedicineData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const t = translations[language];

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');

  const handleScanClick = () => {
    setAppState(AppState.SCANNING);
  };

  const handleCameraCapture = (base64Image: string) => {
    handleImageSelected(base64Image);
  };

  const handleCloseCamera = () => {
    setAppState(AppState.IDLE);
  };

  const handleImageSelected = async (base64Image: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg('');

    try {
      const result = await analyzeMedicineImage(base64Image, language);
      setData(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      setAppState(AppState.ERROR);
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setErrorMsg(message || 'Failed to identify the image. Please try again with a clearer picture.');
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setData(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        toggleLanguage={toggleLanguage}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <SubscriptionPlans
        language={language}
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      {/* Full screen camera overlay */}
      {appState === AppState.SCANNING && (
        <CameraView onCapture={handleCameraCapture} onClose={handleCloseCamera} />
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center">

        <div className="w-full flex-1 flex flex-col justify-center p-4">
          {appState === AppState.IDLE && (
            <div className="animate-fade-in space-y-20">
              <ScanButton
                onScanClick={handleScanClick}
                onImageSelected={handleImageSelected}
                language={language}
              />
            </div>
          )}

          {appState === AppState.ANALYZING && (
            <div className="flex flex-col items-center gap-6">
              <Loading />
              <p className="text-blue-600 dark:text-blue-400 font-bold animate-pulse">{t.analyzing}</p>
            </div>
          )}

          {appState === AppState.SUCCESS && data && (
            <ResultCard data={data} onReset={handleReset} language={language} />
          )}

          {appState === AppState.ERROR && (
            <div className="glass p-8 rounded-3xl shadow-2xl text-center max-w-md mx-auto animate-bounce-in border-2 border-red-100 dark:border-red-900/30">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t.error}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95"
              >
                {t.tryAgain}
              </button>
            </div>
          )}
        </div>
      </main>

      <AIAssistant language={language} />
      <Footer />
    </div>
  );
};

export default App;

