import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

interface ServerToClientEvents {
  'room-created': (code: string) => void;
  'joined-room': (data: { roomCode: string; messages: Message[] }) => void;
  'new-message': (message: Message) => void;
  'user-joined': (userCount: number) => void;
  'user-left': (userCount: number) => void;
  error: (message: string) => void;
}

interface ClientToServerEvents {
  'create-room': () => void;
  'join-room': (roomCode: string) => void;
  'send-message': (data: { roomCode: string; message: string }) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');

export function Chat() {
  const [roomCode, setRoomCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [users, setUsers] = useState<number>(0);

  useEffect(() => {
    socket.on('room-created', (code: string) => {
      setRoomCode(code);
    });

    socket.on('joined-room', ({ roomCode, messages }) => {
      setRoomCode(roomCode);
      setMessages(messages);
      setConnected(true);
    });

    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-joined', (userCount: number) => {
      setUsers(userCount);
    });

    socket.on('user-left', (userCount: number) => {
      setUsers(userCount);
    });

    socket.on('error', (error: string) => {
      alert(error);
    });

    return () => {
      socket.off('room-created');
      socket.off('joined-room');
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('error');
    };
  }, []);

  const createRoom = () => {
    socket.emit('create-room');
  };

  const joinRoom = () => {
    socket.emit('join-room', inputCode.toUpperCase());
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputCode(e.target.value);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send-message', { roomCode, message });
      setMessage('');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Chat</CardTitle>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <div className="space-y-4">
              <div>
                <Button onClick={createRoom} className="w-full">
                  Create New Room
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputCode}
                  onChange={handleInputChange}
                  placeholder="Enter Room Code"
                />
                <Button onClick={joinRoom}>Join Room</Button>
              </div>
              {roomCode && (
                <div className="text-center p-4 bg-muted rounded">
                  Room Code: <span className="font-bold">{roomCode}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Room Code: {roomCode} | Users: {users}/2
              </div>
              <div className="h-[400px] overflow-y-auto border rounded p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === socket.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[70%] ${
                        msg.sender === socket.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Type a message..."
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 