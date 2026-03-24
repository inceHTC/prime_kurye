
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'
import { initSocket } from './lib/socket'

//rotalar
import courierRoutes from './routes/courier.routes'
import authRoutes from './routes/auth.routes'
import orderRoutes from './routes/order.routes'
import adminRoutes from './routes/admin.routes'
import userRoutes from './routes/user.routes'
import paymentRoutes from './routes/payment.routes'
import escrowRoutes from './routes/escrow.routes'
import reportRoutes from './routes/report.routes'
import courierDocRoutes from './routes/courierDoc.routes'
import passwordResetRoutes from './routes/passwordReset.routes'
import addressRoutes from './routes/address.routes'
import { startCronJobs } from './services/cron.service'






const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 4000
const allowedOrigins = new Set(
  [
    'http://localhost:3000',
    process.env.CLIENT_URL,
    ...(process.env.CLIENT_URLS?.split(',') ?? []),
  ]
    .map((origin) => origin?.trim())
    .filter(Boolean) as string[]
)

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true
  }

  if (allowedOrigins.has(origin)) {
    return true
  }

  return /^https:\/\/prime-kurye(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)
}

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('CORS origin not allowed'))
  },
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// API Rotaları
app.use('/api/auth', authRoutes)
app.use('/api/auth', passwordResetRoutes)
app.use('/api/courier', courierRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/escrow', escrowRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/courier-docs', courierDocRoutes)
app.use('/api/addresses', addressRoutes)


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health Check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Vın Kurye API calisiyor', timestamp: new Date() })
})

app.use((_, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadi' })
})

initSocket(httpServer)

httpServer.listen(PORT, () => {
  startCronJobs()
  console.log(`
  Vın Kurye API
  ---------------------
  Port    : ${PORT}
  Ortam   : ${process.env.NODE_ENV || 'development'}
  URL     : http://localhost:${PORT}
  Health  : http://localhost:${PORT}/health
  Socket  : aktif
  `)
})


export default app
