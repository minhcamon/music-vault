import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { config } from './lib/config.js';
import { songsController } from './container.js';
import { songsRoutes } from './modules/songs/songs.routes.js';
import { AppError } from './shared/errors/app-error.js';

const fastify = Fastify({
  logger: true,
});

async function buildServer() {
  await fastify.register(cors, {
    origin: true,
  });

  // Health check endpoint
  fastify.get('/api/health', async () => {
    return { status: 'ok', service: 'AudioVault Hi-Fi Music Server' };
  });

  // Register domain routes with controllers injected from container
  await fastify.register(songsRoutes, { controller: songsController });

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
