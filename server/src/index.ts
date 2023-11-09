import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { typeDefs } from "./schema";
import {getResolvers} from "./resolvers";
import express from "express";
import {PubSub} from "graphql-subscriptions";
import { createServer } from "http";
import {makeExecutableSchema} from '@graphql-tools/schema'
import {WebSocketServer} from 'ws'
import {useServer} from 'graphql-ws/lib/use/ws'
import {expressMiddleware} from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from "body-parser";
import {TrackAPI} from "./datasources/track-api";

async function startApolloServer() {
  const puSub = new PubSub()
  const app = express()
  const httpServer = createServer(app)
  const schema = makeExecutableSchema({
    typeDefs, resolvers: getResolvers(puSub)
  })
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  })
  const serverCleanUp = useServer({
    schema,
    context: async () => {
      const { cache } = server;
      return {
        dataSources: {
          trackAPI: new TrackAPI({ cache }),
        },
      };
    }
  }, wsServer)
  
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({httpServer}),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanUp.dispose()
            }
          }
        }
      }
    ]
  });
  
  await server.start()
  
  app.use('/graphql', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(server, {
    context: async () => {
      const { cache } = server;
      return {
        dataSources: {
          trackAPI: new TrackAPI({ cache }),
        },
      };
    }
  }))
  
  httpServer.listen(4000, () => {
    console.log(`
    🚀  Server is running!
    📭  Query at http://localhost:${4000}/graphql
  `)
  })
  
  /*const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    context: async () => {
      const { cache } = server;
      return {
        dataSources: {
          trackAPI: new TrackAPI({ cache }),
        },
      };
    },
  });
  console.log(`
    🚀  Server is running!
    📭  Query at ${url}
  `);*/
}

startApolloServer();
