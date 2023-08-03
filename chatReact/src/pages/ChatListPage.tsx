import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';

type ChatParams = {
  name: string;
};

interface Message {
  sender: string;
  content: string;
}

function ChatListPage() {
  const { name } = useParams<ChatParams>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState<string>(name || '');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  

  useEffect(() => {
    setUsername(name || '');
  }, [name]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    if (connection && inputText.trim() !== '') {
      const message: Message = {
        sender: username || '',
        content: inputText,
      };

      try {
        await connection.invoke('AddMessage', message);
        setInputText('');
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleLeave = async () => {
    if (connection && username) {
      try {
        await connection.invoke('DeleteUser', username);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7186/chatHub') // Replace with the actual URL of your SignalR hub
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection); // Set the connection in the state

    newConnection.start().then(() => {
      newConnection.invoke('GetAllUsersAsync').then((users: string[]) => {
        setOnlineUsers(users);
      });

      newConnection.invoke('GetMessageList').then((messageList: Message[]) => {
        setMessages(messageList);
      });
    });

    return () => {
      if (newConnection.state === 'Connected') {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.on('MessageAdded', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      connection.on('UserDeleted', (deletedUser: string) => {
        setOnlineUsers((prevUsers) => prevUsers.filter((user) => user !== deletedUser));
      });
    }
  }, [connection]);

  useEffect(() => {
    if (username && !onlineUsers.includes(username)) {
      setOnlineUsers((prevUsers) => [...prevUsers, username]);
    }
  }, [username, onlineUsers]);

  useEffect(() => {
    return () => {
      if (connection && username) {
        connection.invoke('DeleteUser', username).catch((error) => {
          console.error(error);
        });
      }
    };
  }, [connection, username]);

  {onlineUsers.map((user, index) => (
    <p key={user}>{user}</p>
  ))}
  
  {messages.map((message, index) => (
    <div key={message.id}>
      <strong>{message.sender}:</strong> {message.content}
    </div>
  ))}
  

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, backgroundColor: '#f2f2f2', padding: '20px' }}>
        <h3>Online Kullanıcılar:</h3>
        {onlineUsers.map((user, index) => (
          <p key={index}>{user}</p>
        ))}
      </div>
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Chat Odası: {username || ''}</h2>
        <div style={{ width: '60%', border: '1px solid #ccc', padding: '10px', overflowY: 'scroll', marginBottom: '20px' }}>
          {messages.map((message, index) => (
            <div key={index}>
              <strong>{message.sender}:</strong> {message.content}
            </div>
          ))}
        </div>
        <div style={{ width: '60%', display: 'flex' }}>
          <input 
             type="text" 
             value={inputText} 
             onChange={handleInputChange}
             onKeyPress={handleKeyPress} 
             style={{ flex: 1, marginRight: '10px' }} 
             />
          <button onClick={handleSendMessage}>Gönder</button>
        </div>
      </div>
      <Link to="/" style={{ position: 'absolute', top: 10, right: 10 }} onClick={handleLeave}>
        Ayrıl
      </Link>
    </div>
  );
}

export default ChatListPage;
