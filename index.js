import express from 'express';
import mongoose from 'mongoose';
import { init as initAuth } from './backend/auth/initAuthentication.js';
import { router as authRouter } from './backend/routes/auth.routes.js';
import { router as todosRouter } from './backend/routes/todo.routes.js';
import { router as teamsRouter } from './backend/routes/teams.routes.js';
import { isAuthenticated } from './backend/auth/authorization.js';

const app = express();

mongoose.connect(`${process.env.DB_URL}/teamtodolist`);

app.use(express.static('frontend'));

initAuth(app);

app.use(express.json());

app.use('/auth/', authRouter);
app.use('/api/todos', isAuthenticated, todosRouter);
app.use('/api/teams', isAuthenticated, teamsRouter);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server listens to http://localhost:${port}`);
  });
});
