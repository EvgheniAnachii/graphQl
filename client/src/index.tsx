import React from 'react'
import ReactDOM from 'react-dom'
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import QuerySample from './QuerySample'
import SubscriptionSample from './SubscriptionSample'
import MutationSample from './MutationSample'

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
  })
)

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      // Type policy map
      Track: {
        subscriptionType: true,
        fields: {
          // Field policy map for the Product type
          myClientField: {
            // Field policy for the isInCart field
            read(_, { variables }) {
              console.log('READ FIELD ', variables)
              return true
            },
          },
          clientField: {
            // Field policy for the isInCart field
            read(_, { variables }) {
              console.log('READ for SUBSCRIBE FIELD ', variables)
              return true
            },
          },
        },
      },
    },
  }),
})

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <QuerySample />
      <SubscriptionSample />
      <MutationSample />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
