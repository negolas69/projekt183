import mongoose from 'mongoose';

const teamsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  admins: [
    {
      type: mongoose.ObjectId,
      ref: 'users',
      required: true,
    },
  ],
  members: [
    {
      type: mongoose.ObjectId,
      ref: 'users',
      required: true,
    },
  ],
  todos: [
    {
      type: mongoose.ObjectId,
      ref: 'todos',
      required: true,
    },
  ],
});

const model = mongoose.model('teams', teamsSchema);

export { model };
