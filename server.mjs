import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import path from 'path'
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import authApis from "./apis/auth.mjs"
import tweetApi from "./apis/tweet.mjs"
import { userModel } from './dbRepo/models.mjs';
import { stringToHash, varifyHash } from 'bcrypt-inzi';
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
  console.log("type:" , typeof myId);

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

      // console.log("each user type:" , typeof eachUser._id.toString());

      if (eachUser._id.toString() === myId) {

        user.me === true
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

const __dirname = path.resolve();
app.use('/', express.static(path.join(__dirname, './clientside/build')))
app.use('*', express.static(path.join(__dirname, './clientside/build')))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


