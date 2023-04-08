const app=require("./app");
const cloudinary = require ("cloudinary")
 const PORT= process.env.PORT||8000;
 const CLOUD_NAME= process.env.CLOUD_NAME|| "dlygbfyad";
 const API_KEY= process.env.API_KEY || 855977377185268;
 const API_SECRET=process.env.API_SECRET|| "shOdT4JVW0iXMElzoQYumg1FPgE";
 const conncetDataBase=require("./config/dataBase")
//  const dotenv=require("dotenv");
// dotenv.config({path:"backend/config/config.env"});

conncetDataBase();

cloudinary.config({
    cloud_name:CLOUD_NAME,
    api_key:API_KEY,
    api_secret:API_SECRET,
})
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

//unhandel Promise rejection...

process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to Unhandel Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})