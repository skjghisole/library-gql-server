import express from 'express'
import { ApolloServer, gql } from 'apollo-server-express'
import schema from '../schema'
import mongoose from 'mongoose'
import { createServer } from 'http'
import cors from 'cors'

const app = express()
const server = new ApolloServer({ schema })

app.use(cors())

const port = process.env.PORT || 3030

mongoose.connect('mongodb://admin:test123@ds229078.mlab.com:29078/library')
mongoose.connection.once('open', () => {
	console.log('DB connected')
})

server.applyMiddleware({
	app
})

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

// ⚠️ Pay attention to the fact that we are calling `listen` on the http server variable, and not on `app`.
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)
})