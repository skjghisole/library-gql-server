import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLSchema,
	GraphQLID,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull
} from 'graphql'
import { withFilter } from 'graphql-subscriptions';
import Book from '../models/Book'
import Author from '../models/Author'
import pubsub from '../pubsub'

const BOOK_ADDED = 'BOOK_ADDED'
const AUTHOR_ADDED = 'AUTHOR_ADDED'

const BookType = new GraphQLObjectType({
	name: 'Book',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		genre: { type: GraphQLString },
		author: {
			type: AuthorType,
			resolve(parent, args) {
				// return authors.find(x => x.id === parent.authorId)
				return Author.findById(parent.authorId)
			}
		}
	})
})

const AuthorType = new GraphQLObjectType({
	name: 'Author',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		age: { type: GraphQLInt },
		books: {
			type: new GraphQLList(BookType),
			resolve(parent, args) {
				// return books.filter(x => x.authorId === parent.id)
				return Book.find({ authorId: parent.id })
			}
		}
	})
})

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		book: {
			type: BookType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				//code -> database
				// return books.find(x => x.id === args.id)
				return Book.findById(args.id)
			}
		},
		author: {
			type: AuthorType,
			args: { id: { type: GraphQLID } },
			resolve(parent, args) {
				// return authors.find(x => x.id === args.id)
				return Author.findById(args.id)
			}
		},
		books: {
			type: new GraphQLList(BookType),
			resolve(parent, args) {
				// return books
				return Book.find({})
			}
		},
		authors: {
			type: new GraphQLList(AuthorType),
			resolve(parent, args, context) {
				console.log(context.hello)
				// return authors
				return Author.find({})
			} 
		}
	}
})

const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addAuthor: {
			type: AuthorType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				age: { type: GraphQLInt }
			},
			async resolve(parent, { name, age }, { pubsub }) {
				let author = new Author({
					name,
					age
				})
				const newAuthor = await author.save()
				pubsub.publish(AUTHOR_ADDED, newAuthor);
				return newAuthor
			}
		},
		addBook: {
			type: BookType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				genre: { type: GraphQLString },
				authorId: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve(parent, { name, genre, authorId }, { pubsub }) {
				let book = new Book({
					name,
					genre,
					authorId
				})
				pubsub.publish(BOOK_ADDED, { name, genre, authorId });
				return book.save()
			}
		}
	}
})

const Subscription = new GraphQLObjectType({
	name: 'Subscription',
	fields: {
		bookAdded: {
			type: BookType,
			subscribe: () => pubsub.asyncIterator(BOOK_ADDED),
			resolve(payload) {
				return payload
			}
		},
		authorAdded: {
			type: AuthorType,
			args: {
				name: { type: GraphQLString }
			},
			subscribe: withFilter(() => pubsub.asyncIterator(AUTHOR_ADDED),
				(payload, variables) => {
					console.log(payload)
					console.log(variables)
					return true
				}),
			resolve(payload) {
				return payload
			}
		}
	}
})

export default new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation,
	subscription: Subscription
})