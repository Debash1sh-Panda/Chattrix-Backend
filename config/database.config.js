const mongoose = require("mongoose");

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Yahh 😎, Database Connected!");       
    } catch (error) {
        console.log("Ohh No 😢, Database Failed!", error);
        process.exit(1);
    }
}


// const dbConnection = mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((err) => {
//     console.error("Connection error:", err);
//     process.exit(1);
//   });

// require("./config/database.config"); in server.js

module.exports = dbConnection;