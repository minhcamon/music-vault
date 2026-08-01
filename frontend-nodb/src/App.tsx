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
          <div className="relative flex h-screen w-screen overflow-hidden bg-[#0A0C10] text-vault-text select-none">
            {/* Apple Music Ambient Blur Orbs - GPU Accelerated & Hardware Isolated */}
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-600/15 blur-[100px] pointer-events-none transform-gpu z-0" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-blue-600/20 blur-[110px] pointer-events-none transform-gpu z-0" />
            <div className="absolute top-[35%] right-[25%] w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[100px] pointer-events-none transform-gpu z-0" />

            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden pb-28 relative z-10">
              <Header />
              <main
                className="flex-1 overflow-y-auto no-scrollbar relative z-10"
                style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
              >
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
