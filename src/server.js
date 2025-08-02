
const app = require('./app');
const connectDB = require('./config/db');
const { serverPort } = require('./secrit');

// server running
app.listen(serverPort ,async()=>{
    console.log(`my server is running at http://localhost:${serverPort}`);
    // mongoDB connect function
    await connectDB()
})