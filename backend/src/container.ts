import { prisma } from './lib/prisma.js';
import { SongsRepository } from './modules/songs/songs.repository.js';
import { SongsService } from './modules/songs/songs.service.js';
import { SongsController } from './modules/songs/songs.controller.js';

// Composition Root: The ONLY place in the backend where concrete implementations are instantiated.
const songsRepository = new SongsRepository(prisma);
const songsService = new SongsService(songsRepository);
export const songsController = new SongsController(songsService);
