import './login.css'
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";

import { GlobalContext } from '../context/Context';
import { useContext } from "react";

import axios from 'axios';



function ChangePassword() {

    let { state, dispatch } = useContext(GlobalContext);

    const [currentPassword, setCurrentPassword] = useState("")
    const [password, setPassword] = useState("")
    const [result, setResult] = useState("")

    const proceedChangePassword = async (e) => {
        e.preventDefault();

        try {
            let response = await axios.post(`${state.baseUrl}/change-password`, {
                currentPassword: currentPassword,
                password: password
            }, {
                withCredentials: true
            })

            console.log("Password changed successfully");
            setResult("Password changed successfully");

            e.reset();

        } catch (e) {
            console.log("error: ", e);
        }

    }

    return (

        <div className='mainCont'>

            <div className="heading">
                <h1>Change Password</h1>
            </div>

            <div>
                <form onSubmit={proceedChangePassword}>
                    <div className='form'>
                        <input type="password" name="current-Password" className="inputs"
                            id="un" placeholder="Enter your current password"
                            onChange={(e) => { setCurrentPassword(e.target.value) }} />
                        <br />

                        <input type="password" name="new-password"
                            className="inputs" placeholder="New password"
                            onChange={(e) => { setPassword(e.target.value) }} />
                        <br />

                        <input type="password" name="confirm-password"
                            className="inputs" placeholder="Confirm your new password"
                            onChange={(e) => { setPassword(e.target.value) }} />
                        <br />

                        <button type='submit' className='btn'>
                        Change Password
                        </button>

                    </div>
                </form>

                <p>{result}</p>
            </div>
        </div>)
}

export default ChangePassword;