import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from "axios";
import moment from 'moment/moment';
import { useEffect } from 'react';
import { useState, useContext } from 'react';
import './index.css'
import './userList.css'
import { GlobalContext } from '../context/Context';
import InfiniteScroll from 'react-infinite-scroller';




function ChatScreen() {

    let { state, dispatch } = useContext(GlobalContext);

    const [writeMessage, setWriteMessage] = useState("")
    const [users, setUsers] = useState(null)

    useEffect(() => {

    }, [])

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        try {
            const response = await axios.post(`${state.baseUrl}/message`, {
                to: "skdljfskdl",
                text: writeMessage
            })
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
            <h1>Chat Screen</h1>
            <form onSubmit={sendMessage}>
                <input type="text" placeholder='Type your message'
                    onChange={(e) => {
                        setWriteMessage(e.target.value)
                    }} />

                <button type='submit' >Send</button>

            </form>

            {(users?.length) ?
                users?.map((eachUser, i) => {
                    return <div className='listOfUsers' key={i}>
                        <h2>{eachUser.firstName}</h2>
                        <span>{eachUser.email}</span>
                        {(eachUser?.me) ? <span> <br /> Me </span> : null}
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

export default ChatScreen;