import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';

interface RoomData {
  users: number;
  messages: Message[];
}

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

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map<string, RoomData>();

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', () => {
    const roomCode = randomBytes(3).toString('hex').toUpperCase();
    rooms.set(roomCode, { users: 0, messages: [] });
    socket.emit('room-created', roomCode);
  });

  socket.on('join-room', (roomCode: string) => {
    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.users >= 2) {
      socket.emit('error', 'Room is full');
      return;
    }

    socket.join(roomCode);
    room.users++;
    
    socket.emit('joined-room', { roomCode, messages: room.messages });
    io.to(roomCode).emit('user-joined', room.users);
  });

  socket.on('send-message', ({ roomCode, message }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const messageData: Message = {
        id: randomBytes(4).toString('hex'),
        content: message,
        sender: socket.id,
        timestamp: new Date()
      };
      room.messages.push(messageData);
      io.to(roomCode).emit('new-message', messageData);
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomCode) => {
      if (room.users > 0) {
        room.users--;
        io.to(roomCode).emit('user-left', room.users);
        
        if (room.users === 0) {
          rooms.delete(roomCode);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 