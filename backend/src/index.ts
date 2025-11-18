import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import dotenv from 'dotenv';

dotenv.config();

export interface MyContext {
    token?: string;
}

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
    await server.start();

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token as string }),
        }),
    );

    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    const PORT = process.env.PORT || 4000;
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
}

startServer();
