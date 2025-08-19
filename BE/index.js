require("dotenv").config();
const express = require('express')
const app = express()
const port = process.env.PORT;
const documentRoutes = require('./routes/documentRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const userRoutes = require('./routes/userRoutes')
const cors = require('cors')
// Konfigurasi CORS yang sederhana dan robust
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware untuk parsing JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Sajikan file yang diunggah secara statis
app.use('/files', express.static('archivedata'))

app.get('/', (req, res) => {
  res.send('Success Ping To API!')
})

app.use('/api/documents', documentRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/user', userRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
