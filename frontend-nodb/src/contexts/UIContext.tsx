import React, { createContext, useContext, useState } from 'react';
import type { ViewMode, ActiveModal, Album, Song } from '../types';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
}

interface UIContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAlbum: Album | null;
  setSelectedAlbum: (album: Album | null) => void;
  selectedSong: Song | null;
  setSelectedSong: (song: Song | null) => void;
  isQueueDrawerOpen: boolean;
  setIsQueueDrawerOpen: (open: boolean) => void;
  confirmModal: ConfirmModalState;
  openConfirmModal: (opts: Omit<ConfirmModalState, 'isOpen'>) => void;
  closeConfirmModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('songs');
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirmModal = (opts: Omit<ConfirmModalState, 'isOpen'>) => {
    setConfirmModal({ ...opts, isOpen: true });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <UIContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeModal,
        setActiveModal,
        searchQuery,
        setSearchQuery,
        selectedAlbum,
        setSelectedAlbum,
        selectedSong,
        setSelectedSong,
        isQueueDrawerOpen,
        setIsQueueDrawerOpen,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
