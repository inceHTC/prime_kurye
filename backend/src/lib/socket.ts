import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: Server

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    // Müşteri sipariş odasına katılır
    socket.on('join:order', (trackingCode: string) => {
      socket.join(`order:${trackingCode}`)
    })

    // Kurye kendi odasına katılır
    socket.on('join:courier', (courierId: string) => {
      socket.join(`courier:${courierId}`)
    })

    socket.on('leave:order', (trackingCode: string) => {
      socket.leave(`order:${trackingCode}`)
    })
  })

  return io
}

export function getIO(): Server | null {
  return io || null
}

// Sipariş durumu değişince müşteriye ve kuryeye bildir
export function emitOrderUpdate(trackingCode: string, data: any) {
  if (io) io.to(`order:${trackingCode}`).emit('order:updated', data)
}

// Kuryeye yeni sipariş geldiğini bildir
export function emitNewOrderToCourier(courierId: string, order: any) {
  if (io) io.to(`courier:${courierId}`).emit('order:new', order)
}

// Kurye konum güncellemesi
export function emitCourierLocation(trackingCode: string, lat: number, lng: number) {
  if (io) io.to(`order:${trackingCode}`).emit('courier:location', { lat, lng })
}
