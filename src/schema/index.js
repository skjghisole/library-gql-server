import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLSchema,
	GraphQLID,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull
} from 'graphql'

import Book from '../models/Book'
import Author from '../models/Author'

// let books = [
// 	{
// 		name: 'book1',
// 		id: '1',
// 		genre: 'some genre',
// 		authorId: '1'
// 	},
// 	{
// 		name: 'book1-2',
// 		id: '4',
// 		genre: 'some genre',
// 		authorId: '1'
// 	},
// 	{
// 		name: 'book1',
// 		id: '2',
// 		genre: 'some genre',
// 		authorId: '2'
// 	},
// 	{
// 		name: 'book1',
// 		id: '3',
// 		genre: 'some genre',
// 		authorId: '3'
// 	}
// ]

// let authors = [
// 	{
// 		name: 'author1',
// 		id: '1',
// 		age: 24
// 	},
// 	{
// 		name: 'author2',
// 		id: '2',
// 		age: 33
// 	},
// 	{
// 		name: 'author3',
// 		id: '3',
// 		age: 51
// 	}
// ]

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
			resolve(parent, args) {
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
			resolve(parent, { name, age }) {
				let author = new Author({
					name,
					age
				})
				return author.save()
			}
		},
		addBook: {
			type: BookType,
			args: {
				name: { type: new GraphQLNonNull(GraphQLString) },
				genre: { type: GraphQLString },
				authorId: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve(parent, { name, genre, authorId }) {
				let book = new Book({
					name,
					genre,
					authorId
				})
				return book.save()
			}
		}
	}
})

export default new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation
})