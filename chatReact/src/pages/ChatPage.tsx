import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';

function ChatPage() {
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();
  const connection = new HubConnectionBuilder()
    .withUrl('https://localhost:7186/chatHub') // Replace with the actual URL of your SignalR hub
    .configureLogging(LogLevel.Information)
    .build();

  const handleInputChange = (event:any) => {
    setInputText(event.target.value);
  };

  const handleJoinChat = async () => {
    const name = inputText;
    setInputText('');
    navigate(`/chat/${name}`);

    try {
      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
      }

      await connection.invoke('AddUserAsync', name);
    } catch (error) {
      console.error('Error connecting to SignalR hub:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJoinChat();
    }
  };

  return (
    <div>
      <h1>Upstorage Chat</h1>
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress} // Event listener burada ekleniyor
      />
      <button onClick={handleJoinChat}>Join Chat</button>
    </div>
  );
}

export default ChatPage;
