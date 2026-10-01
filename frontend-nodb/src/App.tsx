import { useEffect } from 'react';
import { UIProvider } from './contexts/UIContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { AudioProvider } from './contexts/AudioContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { PlayerDock } from './components/player/PlayerDock';
import { LiveQueueDrawer } from './components/player/LiveQueueDrawer';
import { ViewRouter } from './views/ViewRouter';
import { ModalManager } from './components/modals/ModalManager';

export default function App() {
  useEffect(() => {
    // Request persistent storage so IndexedDB & cover blobs are not cleared automatically
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log('[Storage] Persistent storage granted by browser');
        }
      });
    }
  }, []);
  return (
    <UIProvider>
      <LibraryProvider>
        <AudioProvider>
          <div className="relative flex h-screen w-screen overflow-hidden bg-[#0C0A09] text-vault-text select-none">
            {/* Ambient Tube Glow & Warm Light Orbs - GPU Accelerated */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-600/20 via-orange-600/15 to-amber-500/10 blur-[100px] pointer-events-none transform-gpu z-0" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-amber-700/15 via-stone-800/20 to-amber-600/10 blur-[110px] pointer-events-none transform-gpu z-0" />
            <div className="absolute top-[35%] right-[25%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none transform-gpu z-0" />

            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden pb-36 md:pb-28 relative z-10">
              <Header />
              <main
                className="flex-1 overflow-y-auto no-scrollbar relative z-10"
                style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
              >
                <ViewRouter />
              </main>
            </div>
            <PlayerDock />
            <MobileNav />
            <LiveQueueDrawer />
            <ModalManager />
          </div>
        </AudioProvider>
      </LibraryProvider>
    </UIProvider>
  );
}
