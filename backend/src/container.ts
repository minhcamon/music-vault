import { prisma } from './lib/prisma.js';

import { SourcesRepository } from './modules/sources/sources.repository.js';
import { SourcesService } from './modules/sources/sources.service.js';
import { SourcesController } from './modules/sources/sources.controller.js';

import { ScannerService } from './modules/scanner/scanner.service.js';

import { SongsRepository } from './modules/songs/songs.repository.js';
import { SongsService } from './modules/songs/songs.service.js';
import { SongsController } from './modules/songs/songs.controller.js';

import { AlbumsService } from './modules/albums/albums.service.js';
import { AlbumsController } from './modules/albums/albums.controller.js';

import { ArtistsService } from './modules/artists/artists.service.js';
import { ArtistsController } from './modules/artists/artists.controller.js';

import { BrowseService } from './modules/browse/browse.service.js';
import { BrowseController } from './modules/browse/browse.controller.js';

// Composition Root
export const sourcesRepository = new SourcesRepository(prisma);
export const sourcesService = new SourcesService(sourcesRepository);
export const sourcesController = new SourcesController(sourcesService);

export const scannerService = new ScannerService(prisma);

export const songsRepository = new SongsRepository(prisma);
export const songsService = new SongsService(songsRepository);
export const songsController = new SongsController(songsService);

export const albumsService = new AlbumsService(prisma);
export const albumsController = new AlbumsController(albumsService);

export const artistsService = new ArtistsService(prisma);
export const artistsController = new ArtistsController(artistsService);

export const browseService = new BrowseService();
export const browseController = new BrowseController(browseService);
