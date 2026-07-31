import fs from 'fs';
import path from 'path';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { config } from './lib/config.js';
import {
  sourcesController,
  sourcesRepository,
  songsController,
  albumsController,
  artistsController,
  browseController,
  scannerService,
} from './container.js';
import { sourcesRoutes } from './modules/sources/sources.routes.js';
import { songsRoutes } from './modules/songs/songs.routes.js';
import { albumsRoutes } from './modules/albums/albums.routes.js';
import { artistsRoutes } from './modules/artists/artists.routes.js';
import { browseRoutes } from './modules/browse/browse.routes.js';
import { AppError } from './shared/errors/app-error.js';

const fastify = Fastify({
  logger: true,
});

async function buildServer() {
  await fastify.register(cors, {
    origin: true,
  });

  // Serve cover art images statically
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
  });

  // Health check endpoint
  fastify.get('/api/health', async () => {
    return { status: 'ok', service: 'AudioVault Hi-Fi Music Server' };
  });

  // Trigger Source Scan
  fastify.post('/api/sources/:id/scan', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const result = await scannerService.scanSource(req.params.id);
      return reply.send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Register domain routes
  await fastify.register(sourcesRoutes, { controller: sourcesController });
  await fastify.register(songsRoutes, { controller: songsController });
  await fastify.register(albumsRoutes, { controller: albumsController });
  await fastify.register(artistsRoutes, { controller: artistsController });
  await fastify.register(browseRoutes, { controller: browseController });

  // Global Error Handler
  fastify.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }

    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: 'Internal Server Error',
    });
  });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: config.port, host: config.host });
    console.log(`🚀 AudioVault Backend listening on http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
