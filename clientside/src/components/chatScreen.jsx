import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from "axios";
import moment from 'moment/moment';
import { useEffect } from 'react';
import { useState, useContext } from 'react';
import './index.css'
import './userList.css'
import { useParams } from 'react-router-dom';
import './chatScreen.css'
import { GlobalContext } from '../context/Context';
import InfiniteScroll from 'react-infinite-scroller';





function ChatScreen() {

    let { state, dispatch } = useContext(GlobalContext);

    const { id } = useParams()

    const [writeMessage, setWriteMessage] = useState("")
    const [conversation, setConversation] = useState(null);
    const [recipientProfile, setRecipientProfile] = useState({});

    const getMessages = async () => {
        try {
            const response = await axios.get(`${state.baseUrl}/messages/${id}`)
            console.log("response: ", response.data);
            setConversation(response.data)

        } catch (error) {
            console.log("error in getting messages", error);
        }
    }

    const getRecipientProfile = async () => {
        try {
            let response = await axios.get(
                `${state.baseUrl}/profile/${id}`,
                {
                    withCredentials: true
                });

            console.log("RecipientProfile: ", response);
            setRecipientProfile(response.data)
        } catch (error) {
            console.log("axios error: ", error);
        }
    }

    useEffect(() => {

        getRecipientProfile();
        getMessages();

    }, [])

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        try {
            const response = await axios.post(`${state.baseUrl}/message`, {
                to: id,
                text: writeMessage
            })
            console.log("response: ", response.data);
            getMessages();

        } catch (error) {
            console.log("error in sending message ", error);
        }
    }

    // let baseUrl = "";
    // if (window.location.href.split(":")[0] === "http") {
    //     baseUrl = "http://localhost:5000";
    // }

    return (
        <div className='main'>
            <h1>Chat Screen</h1>
            <h1>Chat with {recipientProfile?.firstName}</h1>
            <span>{recipientProfile?.email}</span>

            <form onSubmit={sendMessage}>
                <input type="text" placeholder='Type your message'
                    onChange={(e) => {
                        setWriteMessage(e.target.value)
                    }} />

                <button type='submit' >Send</button>

            </form>

            <div className="messageCont">
                {(conversation?.length) ?
                    conversation?.map((eachMessage, index) => {
                        const className = (eachMessage.from._id === id) ? "recipientMessage" : "myMessage"
                        return <div key={index}
                            className={`messageBox ${className} `}>
                            <div className="messageText">
                                <div className='name'>{eachMessage.from.firstName}</div>
                                {/* <span className='time'>{moment(eachMessage.createdOn).fromNow()}</span> */}
                                <div className='text'>{eachMessage.text}</div>
                            </div>
                        </div>
                    })
                    : null
                }
            </div>

            {(conversation?.length === 0 ? "No Messages found" : null)}
            {(conversation === null ? "Loading..." : null)}
        </div>
    )
}

export default ChatScreen;