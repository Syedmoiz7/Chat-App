import './login.css'
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";

import { GlobalContext } from '../context/Context';
import { useContext } from "react";

import axios from 'axios';



function Login() {

    let { state, dispatch } = useContext(GlobalContext);

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [result, setResult] = useState("")

    const loginHandler = async (e) => {
        e.preventDefault();

        try {
            let response = await axios.post(`${state.baseUrl}/login`, {
                email: email,
                password: password
            }, {
                withCredentials: true
            })

            dispatch({
                type: "USER_LOGIN",
                payload: response.data.profile
            })

            console.log("login successfull");
            setResult("login successfull");
        } catch (e) {
            console.log("error: ", e);
        }

    }

    return (

        <div className='mainCont'>

            <div className="heading">
                <h1>Login</h1>
            </div>

            <div>
                <form onSubmit={loginHandler}>
                    <div className='form'>
                        <input type="email" name="email" className="inputs"
                            id="un" placeholder="Email"
                            onChange={(e) => { setEmail(e.target.value) }} />
                        <br />

                        <input type="password" name="password"
                            className="inputs" placeholder="Password"
                            onChange={(e) => { setPassword(e.target.value) }} />
                        <br />

                        <button type='submit' className='btn'>
                            Login
                        </button>

                        <p>Don't have an account? </p>
                        <Link to={'/signup'}>Signup</Link>

                        <br />

                        <button><Link to={'/forget-password'}>Forget Password ?</Link></button>


                    </div>
                </form>

                <p>{result}</p>
            </div>
        </div>)
}

export default Login;