import { UIProvider } from './contexts/UIContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { AudioProvider } from './contexts/AudioContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { PlayerDock } from './components/player/PlayerDock';
import { LiveQueueDrawer } from './components/player/LiveQueueDrawer';
import { ViewRouter } from './views/ViewRouter';
import { ModalManager } from './components/modals/ModalManager';

export default function App() {
  return (
    <UIProvider>
      <LibraryProvider>
        <AudioProvider>
          <div className="flex h-screen w-screen overflow-hidden bg-vault-bg text-vault-text select-none">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden pb-24">
              <Header />
              <main className="flex-1 overflow-y-auto no-scrollbar">
                <ViewRouter />
              </main>
            </div>
            <PlayerDock />
            <LiveQueueDrawer />
            <ModalManager />
          </div>
        </AudioProvider>
      </LibraryProvider>
    </UIProvider>
  );
}
