import React, { Suspense, lazy } from 'react';
import GameLobby from './pages/GameLobby';
import { RouteErrorBoundary } from './components/v1/RouteErrorBoundary';
import { I18nProvider, useI18n } from './i18n/provider';
import LocaleSwitcher from './components/LocaleSwitcher';
import { ModalStackProvider } from './components/v1/modal-stack';

const DevContractCallSimulatorPanel = import.meta.env.DEV
  ? lazy(() =>
      import('./components/dev/ContractCallSimulatorPanel').then((m) => ({
        default: m.ContractCallSimulatorPanel,
      })),
    )
  : undefined;

const AppContent: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="app-header" role="banner">
        <div className="logo">{t('app.title')}</div>
        <nav aria-label="Main navigation">
          <ul>
            <li><a href="/" className="active">{t('nav.lobby')}</a></li>
            <li><a href="/games">{t('nav.games')}</a></li>
            <li><a href="/profile">{t('nav.profile')}</a></li>
          </ul>
        </nav>
        <LocaleSwitcher />
      </header>
      
      <main className="app-content" id="main-content">
        <RouteErrorBoundary>
          <GameLobby />
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
    <I18nProvider>
      <ModalStackProvider>
        <AppContent />
      </ModalStackProvider>
    </I18nProvider>
  );
};

export default App;
