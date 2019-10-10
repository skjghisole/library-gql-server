import mongoose from 'mongoose'

const { Schema, model } = mongoose

const authorSchema = new Schema({
	name: String,
	age: Number,
})

export default model('Author', authorSchema)