import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import { generateEssay } from './generateEssay'

const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/generate-essay', generateEssay)

const PORT = process.env.PORT || 3001
const SERVER_DOMAIN = process.env.SERVER_DOMAIN

app.listen(PORT, () => {
  console.log(`server running on ${SERVER_DOMAIN}`)
})
