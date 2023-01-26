import express from 'express'
import { userModel, otpModel } from "./../dbRepo/models.mjs"
import jwt from 'jsonwebtoken';
import { customAlphabet, nanoid } from "nanoid";
import moment from 'moment/moment.js';
import {
    stringToHash,
    varifyHash
} from "bcrypt-inzi";
import SendEmail  from './sendingMails/sendMail.mjs'
import * as dotenv from 'dotenv'
dotenv.config()


const SECRET = process.env.SECRET || "topsecret";

const router = express.Router()

router.post("/signup", (req, res) => {

    let body = req.body;

    if (!body.firstName
        || !body.lastName
        || !body.email
        || !body.password
    ) {
        res.status(400).send(
            `required fields missing, request example: 
              {
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "abc@abc.com",
                  "password": "12345"
              }`
        );
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    // check if user already exist // query email user
    userModel.findOne({ email: body.email }, (err, user) => {
        if (!err) {
            console.log("user: ", user);

            if (user) { // user already exist
                console.log("user already exist: ", user);
                res.status(400).send({ message: "user already exist,, please try a different email" });
                return;

            } else { // user not already exist

                stringToHash(body.password).then(hashString => {

                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        password: hashString
                    },
                        (err, result) => {
                            if (!err) {
                                console.log("user saved: ", result);
                                res.status(201).send({ message: "user is created" });
                            } else {
                                console.log("db error: ", err);
                                res.status(500).send({ message: "internal server error" });
                            }
                        });
                })

            }
        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
            return;
        }
    })
});


router.post("/login", (req, res) => {

    let body = req.body;

    if (!body.email || !body.password) { // null check - undefined, "", 0 , false, null , NaN
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    body.email = body.email.toLowerCase();


    // check if user already exist // query email user
    userModel.findOne(
        { email: body.email },
        // { email:1, firstName:1, lastName:1, age:1, password:0 },
        "email firstName lastName password",
        (err, data) => {
            if (!err) {
                console.log("data: ", data);

                if (data) { // user found
                    varifyHash(body.password, data.password).then(isMatched => {

                        console.log("isMatched: ", isMatched);

                        if (isMatched) {

                            const token = jwt.sign({
                                _id: data._id,
                                email: data.email,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                            }, SECRET);

                            console.log("token: ", token);

                            res.cookie('Token', token, {
                                maxAge: 86_400_000,
                                httpOnly: true
                            });

                            res.send({
                                message: "login successful",
                                profile: {
                                    email: data.email,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    age: data.age,
                                    _id: data._id
                                }
                            });
                            return;
                        } else {
                            console.log("password did not match");
                            res.status(401).send({ message: "Incorrect email or password" });
                            return;
                        }
                    })

                } else { // user not already exist
                    console.log("user not found");
                    res.status(401).send({ message: "Incorrect email or password" });
                    return;
                }
            } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "login failed, please try later" });
                return;
            }
        })



})


router.post("/logout", (req, res) => {

    res.clearCookie('Token', {
        httpOnly: true,
        samesite: "none",
        secure: true
    });

    res.send({ message: "Logout successful" });
})


router.post("/forget-password", async (req, res) => {

    try {

        let body = req.body;
        body.email = body.email.toLowerCase();

        if (!body.email) { // null check - undefined, "", 0 , false, null , NaN
            res.status(400).send(
                `required fields missing, request example: 
                {
                    "email": "abc@abc.com"
                }`
            );
            return;
        }

        // check if user already exist 
        const user = await userModel.findOne(
            { email: body.email },
            "firstName email",
        ).exec()

        if (!user) throw new Error("user not found");

        const nanoid = customAlphabet('1234567890', 6)
        const OTP = nanoid()
        const otpHash = await stringToHash(OTP)

        console.log("otp: ", OTP);

        otpModel.create({
            otp: otpHash,
            email: body.email
        })

        await SendEmail ({
            email: body.email,
            subject: `Froget password Request`,
            text: `Your OTP code is ${OTP}`,
          });

        res.send({
            message: "OTP send successfully",
        });
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send({
            message: error.message
        })
    }

})

router.post("/forget-password-2", async (req, res) => {

    try {

        let body = req.body;
        body.email = body.email.toLowerCase();

        if (!body.email || !body.otp || !body.newPassword) { // null check - undefined, "", 0 , false, null , NaN
            res.status(400).send(
                `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "otp": "123456",
                    "newPassword": "some secret string" 
                }`
            );
            return;
        }

        // check if otp already exist 
        const otpRecord = await otpModel.findOne(
            { email: body.email },
            // "firstName email",
        )
        .sort({ _id: -1 })
        .exec()

        
        if (!otpRecord) throw new Error("Invalid Otp");
        if (otpRecord.isUsed) throw new Error("Invalid Otp");

        await otpRecord.update({isUsed: true}).exec()

        console.log("otp record:", otpRecord);
        console.log("otp record:", moment(otpRecord.createdOn));

        const now = moment();
        const otpCreatedTime = moment(otpRecord.createdOn)
        const diffInMinutes = now.diff(otpCreatedTime, "minutes")

        console.log("diffInMinutes: ", diffInMinutes);
        
        if(diffInMinutes >= 5) throw new Error("Invalid Otp")

        const isMatched = await varifyHash(body.otp, otpRecord.otp)

        if(!isMatched) throw new Error ("Invalid Otp")

        const newHash = await stringToHash(body.newPassword)

          await userModel.updateOne({ email: body.email }, { password: newHash }).exec()

          res.send({
            message: "password updated successfully",
          });

        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send({
            message: error.message
        })
    }

})


export default router