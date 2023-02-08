import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from "axios";
import moment from 'moment/moment';
import { useEffect } from 'react';
import { useState, useContext } from 'react';
import './index.css'
import './userList.css'
import { GlobalContext } from '../context/Context';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';




function UserList() {

    let { state, dispatch } = useContext(GlobalContext);

    const [searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState(null)

    useEffect(() => {
        getUsers();
    }, [])

    const getUsers = async (e) => {
        if (e) e.preventDefault();
        try {
            const response = await axios.get(`${state.baseUrl}/users?q=${searchTerm}`)
            console.log("response: ", response.data);

            setUsers(response.data)

        } catch (error) {
            console.log("error in getting users ", error);
        }
    }

    let baseUrl = "";
    if (window.location.href.split(":")[0] === "http") {
        baseUrl = "http://localhost:5000";
    }

    return (
        <div className='main'>
            <h1>Search User to start chat</h1>
            <form onSubmit={getUsers}>
                <input type="search" placeholder='Search users '
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                    }} />

                <button type='submit' >Search</button>

            </form>

            {(users?.length) ?
                users?.map((eachUser, i) => {
                    return <div className='listOfUsers' key={i}>
                        <Link to={`/chat/${eachUser._id}`}>
                            <h2>{eachUser.firstName}</h2>
                            <span>{eachUser.email}</span>
                            {(eachUser?.me) ? <span> <br /> Me </span> : null}
                        </Link>
                    </div>
                })
                :
                null
            }

            {(users?.length === 0) ? "No users found" : null}
            {(users === null) ? "Loading..." : null}

        </div>
    )
}

export default UserList;