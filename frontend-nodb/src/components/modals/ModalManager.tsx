import React from 'react';
import { SourceModal } from './SourceModal';
import { SongDetailModal } from './SongDetailModal';
import { AlbumDetailModal } from './AlbumDetailModal';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import { PlaylistDetailModal } from './PlaylistDetailModal';
import { ConfirmModal } from './ConfirmModal';

export const ModalManager: React.FC = () => {
  return (
    <>
      <SourceModal />
      <SongDetailModal />
      <AlbumDetailModal />
      <CreatePlaylistModal />
      <AddToPlaylistModal />
      <PlaylistDetailModal />
      <ConfirmModal />
    </>
  );
};
