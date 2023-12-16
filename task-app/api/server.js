import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Todo from "./models/Todo.js";

const secret = 'secret123';

await mongoose.connect('mongodb://localhost:27017/auth-todo', {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.log);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({extended:true}));
app.use(cors({
  credentials:true,
  origin: 'http://localhost:3000',
}));

app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/user', (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    User.findById(payload.id)
      .then(userInfo => {
        if (!userInfo) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: userInfo._id, email: userInfo.email });
      })
      .catch(error => {
        console.error('Error fetching user information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (error) {
    console.error('Error decoding token:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// new user registration
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ password: hashedPassword, email });
   // Save the user to the database
    const userInfo = await user.save();
    jwt.sign({ id: userInfo._id, email: userInfo.email }, secret, (err, token) => {
      if (err) {
        console.error('Error creating JWT token:', err);
        res.sendStatus(500);
      } else {
        res.cookie('token', token).json({ id: userInfo._id, email: userInfo.email });
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.sendStatus(500); 
    }
  }
});

//user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Find a user in the database based on the provided email
  User.findOne({ email })
    .then(userInfo => {
      if (!userInfo) {
        return res.sendStatus(401);
      }
      // Compare the provided password with the hashed password stored in the database
      const passOk = bcrypt.compareSync(password, userInfo.password);
      // If the passwords match, generate a JWT token
      if (passOk) {
        jwt.sign({ id: userInfo._id, email }, secret, (err, token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.cookie('token', token).json({ id: userInfo._id, email: userInfo.email });
          }
        });
      } else {
        // If passwords do not match, send a 401 Unauthorized status
        res.sendStatus(401);
      }
    })
    .catch(error => {
      // Handle any errors that occur during the user lookup process
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

//user logout
app.post('/logout', (req, res) => {
  try {
    res.cookie('token', '').send();
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//find todo item
app.get('/todos', async (req, res) => {
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const todos = await Todo.find({ user: new mongoose.Types.ObjectId(payload.id) });
    res.json(todos);
  } catch (error) {
    console.error('Error retrieving todos:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.sendStatus(500);
    }
  }
});

// Save the new todo to the database
app.put('/todos', (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);
  const todo = new Todo({
    text: req.body.text,
    done: false,
    user: new mongoose.Types.ObjectId(payload.id),
  });
  todo.save().then(todo => {
    res.json(todo);
  })
  .catch(error => {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// Update the specified todo item in the database
app.post('/todos', (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);
  Todo.updateOne({
    _id: new mongoose.Types.ObjectId(req.body.id),
    user: new mongoose.Types.ObjectId(payload.id),
  }, {
    done: req.body.done,
  }).then(() => {
    res.sendStatus(200);
  })
  .catch(error => {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

//To delete task from the list
app.delete('/todos/:id', (req, res) => {
  try {
    const payload = jwt.verify(req.cookies.token, secret);

    Todo.deleteOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      user: new mongoose.Types.ObjectId(payload.id)
    })
      .then((result) => {
        if (result.deletedCount > 0) {
          res.status(200).json({ message: 'Successfully deleted' });
        } else {
          res.status(404).json({ error: 'Item not found' });
        }
      })
      .catch((error) => {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: 'Internal server error' });
      });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

//To update task from the list
app.put('/todos/:id', (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);

  Todo.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(req.params.id),
      user: new mongoose.Types.ObjectId(payload.id)
    },
    { text: req.body.text },
    { new: true } 
  )
    .then(updatedTodo => {
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found or unauthorized' });
      }

      res.status(200).json(updatedTodo);
    })
    .catch(error => {
      console.error("Error updating todo:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.listen(4000);