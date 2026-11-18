// import mongoose from 'mongoose'
// import app from '../app.js'
// import { connectDatabase } from '../config/db.js'

// let databaseConnection

// async function ensureDatabaseConnection() {
//   if (mongoose.connection.readyState === 1) return
//   if (!databaseConnection) {
//     databaseConnection = connectDatabase().catch((error) => {
//       databaseConnection = undefined
//       throw error
//     })
//   }
//   await databaseConnection
// }

// export default async function handler(request, response) {
//   try {
//     await ensureDatabaseConnection()
//   } catch (error) {
//     console.error('Unable to connect to MongoDB for API request', error)
//     return response.status(503).json({
//       success: false,
//       message: 'Service temporarily unavailable',
//     })
//   }

//   return app(request, response)
// }
import app from '../app.js'

export default app