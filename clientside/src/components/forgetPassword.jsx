import './login.css'
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";

import { GlobalContext } from '../context/Context';
import { useContext } from "react";

import axios from 'axios';



function ForgetPassword() {

    let { state, dispatch } = useContext(GlobalContext);

    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [result, setResult] = useState("")
    const [isOtpSend, setIsOtpSend] = useState(false)

    const sendOtp = async (e) => {
        e.preventDefault();

        try {
            let response = await axios.post(`${state.baseUrl}/forget-password`, {
                email: email
            }, {
                withCredentials: true
            })

            console.log(response.data.message);
            setResult(response.data.message);
            setIsOtpSend(true)

        } catch (e) {
            console.log("error: ", e);
            setResult(e.response?.data?.message);
        }

    }

    const updatePassword = async (e) => {
        e.preventDefault();

        try {
            let response = await axios.post(`${state.baseUrl}/forget-password-2`, {
                email: email,
                otp: otp,
                newPassword: newPassword
            }, {
                withCredentials: true
            })

            console.log(response.data.message);
            setResult(response.data.message);

        } catch (e) {
            console.log("error: ", e);
            setResult(e.response?.data?.message);
        }

    }

    return (

        <div className='mainCont'>

            <div className="heading">
                <h1>Forget Password</h1>
            </div>

            <div>



                {(!isOtpSend) ?

                    <form onSubmit={sendOtp}>
                        <div className='form'>

                            <input type="email" name="email" className="inputs"
                                id="un" placeholder="Email" autoComplete='username'
                                onChange={(e) => { setEmail(e.target.value) }} />
                            <br />

                            <button type='submit' className='btn'>
                                Send OTP
                            </button>

                            <br />

                            <Link to={'/login'}>login</Link>

                        </div>
                    </form>
                    :
                    <form onSubmit={updatePassword}>
                        <div className='form'>

                            <input type="email" name="email" className="inputs"
                                id="un" placeholder="Email" autoComplete='username'
                                disabled />
                            <br />

                            <input type="text" name="otp" className="inputs"
                                id="un" placeholder="Enter your OTP" autoComplete='otp'
                                onChange={(e) => { setOtp(e.target.value) }} />
                            <br />

                            <input type="password" name="newPassword" className="inputs"
                                id="un" placeholder="Enter your new password"
                                autoComplete='new-password'
                                onChange={(e) => { setNewPassword(e.target.value) }} />
                            <br />

                            <button type='submit' className='btn'>
                                Update Password
                            </button>

                            <br />

                            <Link to={'/login'}>login</Link>

                        </div>
                    </form>
                }









                <p>{result}</p>
            </div>
        </div>)
}

export default ForgetPassword;