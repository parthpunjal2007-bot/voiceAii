import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Generate = React.lazy(() => import('./pages/Generate'));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Components
const Header = React.lazy(() => import('./components/Header'));

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #8b5cf6;
    --accent: #06b6d4;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark: #0f172a;
    --light: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 6px 12px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 25px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 50px -12px rgb(0 0 0 / 0.25);
    
    --radius-sm: 0.375rem;
    --radius: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
    
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'Space Grotesk', 'SF Mono', Monaco, monospace;
  }

  body {
    font-family: var(--font-sans);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: var(--light);
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background: rgba(99, 102, 241, 0.3);
    color: white;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark);
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px;
`;

const LoadingFallback = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--dark) 0%, var(--gray-900) 100%);
  gap: 1.5rem;
`;

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: var(--primary);
  width: 48px;
  height: 48px;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <AppContainer>
        <Suspense fallback={
          <LoadingFallback
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Sparkles size={64} />
            <LoadingSpinner />
            <p style={{ color: 'var(--gray-400)' }}>Loading AI Magic...</p>
          </LoadingFallback>
        }>
          <Header />
          <MainContent>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AnimatePresence>
          </MainContent>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--gray-800)',
              color: 'var(--light)',
              border: '1px solid var(--gray-700)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-sans)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger)',
                secondary: 'white',
              },
            },
          }}
        />
      </AppContainer>
    </Router>
  );
}

export default App;