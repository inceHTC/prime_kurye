import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Belirli sipariş odasına katıl (takip sayfası)
export function joinOrderRoom(trackingCode: string) {
  const s = getSocket()
  s.emit('join:order', trackingCode)
}

export function leaveOrderRoom(trackingCode: string) {
  const s = getSocket()
  s.emit('leave:order', trackingCode)
}

// Kurye odasına katıl (kurye paneli)
export function joinCourierRoom(courierId: string) {
  const s = getSocket()
  s.emit('join:courier', courierId)
}
