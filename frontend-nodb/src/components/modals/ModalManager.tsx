import React from 'react';
import { SourceModal } from './SourceModal';
import { SongDetailModal } from './SongDetailModal';
import { AlbumDetailModal } from './AlbumDetailModal';
import { ConfirmModal } from './ConfirmModal';

export const ModalManager: React.FC = () => {
  return (
    <>
      <SourceModal />
      <SongDetailModal />
      <AlbumDetailModal />
      <ConfirmModal />
    </>
  );
};
