import mongoose from 'mongoose'

const { Schema, model } = mongoose

const bookSchema = new Schema({
	name: String,
	genre: String,
	authorId: String
})

export default model('Book', bookSchema)