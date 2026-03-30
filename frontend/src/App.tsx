import React, { Suspense, lazy } from 'react';
import GameLobby from './pages/GameLobby';
import { RouteErrorBoundary } from './components/v1/RouteErrorBoundary';
import ProfileSettings from './pages/ProfileSettings';
import { I18nProvider, useI18n } from './i18n/provider';
import LocaleSwitcher from './components/LocaleSwitcher';
import Breadcrumbs from './components/BreadCrumbs';

import { ModalStackProvider } from './components/v1/modal-stack';
import { FeatureFlagsProvider } from './services/feature-flags';
import CommandPalette, { type Command } from './components/v1/CommandPalette';
import { BrowserRouter } from 'react-router-dom';
import AppSidebar, { type AppRoute } from './components/v1/AppSidebar';

const DevContractCallSimulatorPanel = import.meta.env.DEV
  ? lazy(() =>
      import('./components/dev/ContractCallSimulatorPanel').then((m) => ({
        default: m.ContractCallSimulatorPanel,
      })),
    )
  : undefined;

const AppContent: React.FC = () => {
  const { t } = useI18n();
  const [route, setRoute] = React.useState<AppRoute>('lobby');

  const commands: Command[] = [
    {
      id: 'go-lobby',
      label: 'Go to Lobby',
      description: 'Open the game lobby',
      action: () => setRoute('lobby'),
    },
    {
      id: 'go-games',
      label: 'Go to Games',
      description: 'Open the games section',
      action: () => setRoute('games'),
    },
    {
      id: 'go-profile',
      label: 'Go to Profile Settings',
      description: 'Open the profile settings page',
      action: () => setRoute('profile'),
    },
  ];

  return (
    <div className="app-container">
      <CommandPalette commands={commands} />
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <AppSidebar currentRoute={route} onNavigate={setRoute} />

      <div className="app-main-layout">
        <header className="app-header" role="banner">
          <div className="logo">{t('app.title')}</div>
          <LocaleSwitcher />
        </header>

        <Breadcrumbs />

        <main className="app-content" id="main-content">
          <RouteErrorBoundary>
            {route === 'profile' ? <ProfileSettings /> : <GameLobby />}
          </RouteErrorBoundary>
        </main>

        <footer className="app-footer" role="contentinfo">
          <div className="footer-content">
            <p>{t('footer.copyright')}</p>
            <div className="footer-links">
              <a href="/terms">{t('footer.terms')}</a>
              <a href="/privacy">{t('footer.privacy')}</a>
            </div>
          </div>
        </footer>
      </div>

      {import.meta.env.DEV && DevContractCallSimulatorPanel ? (
        <Suspense fallback={null}>
          <DevContractCallSimulatorPanel />
        </Suspense>
      ) : null}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <FeatureFlagsProvider>
        <I18nProvider>
          <ModalStackProvider>
            <AppContent />
          </ModalStackProvider>
        </I18nProvider>
      </FeatureFlagsProvider>
    </BrowserRouter>
  );
};

export default App;
