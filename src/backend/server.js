import express from 'express'
import graphqlHTTP from 'express-graphql'
import schema from '../schema'
import mongoose from 'mongoose'

const app = express()

mongoose.connect('mongodb://admin:test123@ds229078.mlab.com:29078/library')
mongoose.connection.once('open', () => {
	console.log('DB connected')
})
app.use("/graphql", graphqlHTTP({
	schema,
	graphiql: true
}))

const port = process.env.PORT || 3030

app.listen(port, () => console.log(`Server Starting at http://localhost:${port}`))