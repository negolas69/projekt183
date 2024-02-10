import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    required: true,
  },
  responsible: {
    type: mongoose.ObjectId,
    ref: 'users',
    required: true,
  },
});

const model = mongoose.model('todos', todoSchema);

export { model };
