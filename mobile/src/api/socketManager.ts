import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'https://skillconnect-backend-97u2.onrender.com';

class SocketManager {
  private socket: Socket | null = null;
  private appStateSubscription: any = null;
  private activeBookingRooms: Set<string> = new Set();
  private activeLocationRooms: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxAttempts = 5;

  constructor() {
    this.setupAppStateListener();
  }

  public getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: this.maxAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('[SocketManager] Connected:', this.socket?.id);
        this.reconnectAttempts = 0;
        this.restoreSubscriptions();
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('[SocketManager] Disconnected:', reason);
      });
    }
    return this.socket;
  }

  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[SocketManager] App entered foreground. Verifying socket connection...');
        this.ensureConnected();
      }
    });
  }

  public ensureConnected() {
    const socket = this.getSocket();
    if (!socket.connected && this.reconnectAttempts < this.maxAttempts) {
      this.reconnectAttempts++;
      socket.connect();
    }
  }

  public joinBookingRoom(bookingId: string) {
    const socket = this.getSocket();
    this.activeBookingRooms.add(bookingId);
    if (socket.connected) {
      socket.emit('join_booking_room', bookingId);
    }
  }

  public leaveBookingRoom(bookingId: string) {
    const socket = this.getSocket();
    this.activeBookingRooms.delete(bookingId);
    if (socket.connected) {
      socket.emit('leave_booking_room', bookingId);
    }
  }

  public joinLocationRoom(roomId: string) {
    const socket = this.getSocket();
    this.activeLocationRooms.add(roomId);
    if (socket.connected) {
      socket.emit('join_location_room', roomId);
    }
  }

  public emitLocationUpdate(roomId: string, coords: number[]) {
    const socket = this.getSocket();
    if (socket.connected) {
      socket.emit('location_update', { roomId, coords, timestamp: Date.now() });
    }
  }

  private restoreSubscriptions() {
    const socket = this.getSocket();
    if (!socket || !socket.connected) return;

    this.activeBookingRooms.forEach((bookingId) => {
      socket.emit('join_booking_room', bookingId);
    });

    this.activeLocationRooms.forEach((roomId) => {
      socket.emit('join_location_room', roomId);
    });
  }
}

export const socketManager = new SocketManager();
