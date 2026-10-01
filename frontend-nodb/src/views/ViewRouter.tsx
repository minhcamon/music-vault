import React from 'react';
import { useUI } from '../contexts/UIContext';
import { SongsView } from './SongsView';
import { AlbumsView } from './AlbumsView';
import { ArtistsView } from './ArtistsView';
import { PlaylistsView } from './PlaylistsView';
import { SourcesView } from './SourcesView';

export const ViewRouter: React.FC = () => {
  const { viewMode } = useUI();

  switch (viewMode) {
    case 'songs':
      return <SongsView />;
    case 'albums':
      return <AlbumsView />;
    case 'artists':
      return <ArtistsView />;
    case 'playlists':
      return <PlaylistsView />;
    case 'sources':
      return <SourcesView />;
    default:
      return <SongsView />;
  }
};
