import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import path from 'path'
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import authApis from "./apis/auth.mjs"
import tweetApi from "./apis/tweet.mjs"
import { userModel, messageModel } from './dbRepo/models.mjs';
import { stringToHash, varifyHash } from 'bcrypt-inzi';
import { Server as socketIo } from "socket.io";
import { createServer } from 'http'
import { get } from 'http';
import { stringify } from 'querystring';



const SECRET = process.env.SECRET || "topsecret";

const app = express()
const port = process.env.PORT || 5000

// app.use(cors());
app.use(express.json())
app.use(cookieParser());


app.use(cors({
  origin: ['http://localhost:3000', "*"],
  credentials: true
}));


app.use("/api/v1", authApis)


app.use("/api/v1", (req, res, next) => {
  console.log("req.cookies: ", req.cookies);

  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request"
    })
    return;
  }
  jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
    if (!err) {

      console.log("decodedData: ", decodedData);

      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate) {
        res.status(401);

        res.cookie('Token', '', {
          maxAge: 1,
          httpOnly: true
        });

        res.send({ message: "token expired" });
      } else {

        console.log("token approved");

        req.body.token = decodedData
        next();
      }
    } else {
      res.status(401).send("invalid token")
    }
  });
})


app.use("/api/v1", tweetApi)


const getUser = async (req, res) => {

  let _id = "";
  if (req.params.id) {
    _id = req.params.id
  } else {
    _id = req.body.token._id
  }

  try {
    const user = await userModel.findOne({ _id: _id }).exec();

    if (!user) {
      res.status(404);
      return

    } else {
      res.status(200).send(user)
    }

  } catch (error) {
    console.log("error: ", error);
    res.status(500).send({
      message: "something went wrong on server"
    })
  }

}

app.get('/api/v1/profile', getUser);

app.get('/api/v1/profile/:id', getUser);

app.post('/api/v1/change-password', async (req, res) => {

  try {
    const body = req.body;
    const currentPassword = body.currentPassword;
    const newPassword = body.password;
    const _id = req.body.token._id

    // check if user already exist 
    const user = await userModel.findOne(
      { _id: _id },
      "password",
    ).exec()

    if (!user) throw new Error("user not found");

    const isMatched = await varifyHash(currentPassword, user.password)
    if (!isMatched) throw new Error("Incorrect email or password")

    const newHash = await stringToHash(newPassword)

    await userModel.updateOne({ _id: _id }, { password: newHash }).exec()

    res.send({
      message: "password change successfully",
    });
    return;

  } catch (error) {
    console.log("error: ", error);
    res.status(500).send("error")
  }

})

app.get('/api/v1/users', async (req, res) => {

  const myId = req.body.token._id

  try {
    const q = req.query.q
    console.log("query: ", q);

    let query;

    if (q) {
      query = userModel.findOne({ $text: { $search: q } })
    } else {
      query = userModel.find({}).limit(20)
    }

    const users = await query.exec()

    const modifiedUserList = users.map(eachUser => {

      let user = {
        _id: eachUser._id,
        firstName: eachUser.firstName,
        lastName: eachUser.lastName,
        email: eachUser.email
      }

      if (eachUser._id.toString() === myId) {
        user.me = true
        return user;

      } else {
        return user;
      }
    })

    res.send(modifiedUserList);

  } catch (err) {
    console.log("Error: ", err);
    res.send([])
  }


})

app.post('/api/v1/message', async (req, res) => {

  if (
    !req.body.text ||
    !req.body.to
  ) {
    res.status("400").send("invalid input")
    return;
  }

  const sent = await messageModel.create({
    from: req.body.token._id,
    to: req.body.to,
    text: req.body.text
  })

  io.emit(`${req.body.to}-${req.body.token._id}`, sent)

  console.log("sent: ", sent)

  res.send("message sent successfully");
})

app.get('/api/v1/messages/:id', async (req, res) => { 

  const messages = await messageModel.find({
    $or: [
      {
        from: req.body.token._id,
        to: req.params.id
      },
      {
        from: req.params.id,
        to: req.body.token._id,
      }
    ]
  })
    .populate({ path: 'from', select: 'firstName lastName email' })
    .populate({ path: 'to', select: 'firstName lastName email' })
    .limit(100)
    // .sort({ _id: -1 }) 
    .exec();

  res.send(messages);

})

const __dirname = path.resolve();
app.use('/', express.static(path.join(__dirname, './clientside/build')))
app.use('*', express.static(path.join(__dirname, './clientside/build')))

// THIS IS THE ACTUAL SERVER WHICH IS RUNNING
const server = createServer(app);

// handing over server access to socket.io
const io = new socketIo(server, { cors: { origin: "*", methods: "*", } });

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


io.on("connection", (socket) => {
  console.log("New client connected with id: ", socket.id);

  // to emit data to a certain client
  socket.emit("topic 1", "some data")

  // collecting connected users in a array
  // connectedUsers.push(socket)

  socket.on("disconnect", (message) => {
      console.log("Client disconnected with id: ", message);
  });
});


// to emit data to a certain client
//  connectedUsers[0].emit("topic 1", "some data")

setInterval(() => {

  // to emit data to all connected client
  // first param is topic name and second is json data
  io.emit("Test topic", { event: "ADDED_ITEM", data: "some data" });
  console.log("emiting data to all client");

}, 2000)

