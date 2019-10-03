import express from 'express'

const app = express()
const port = process.env.PORT || 3030

app.listen(port, () => console.log(`Server Starting at http://localhost:${port}`))