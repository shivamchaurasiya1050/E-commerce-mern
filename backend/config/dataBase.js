const mongoose=require("mongoose");
mongoose.set('strictQuery', true);

const conncetDataBase=()=>{
    mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce").then((data)=>{
        console.log(`mongodb connect with server ${data.connection.host}`)
    }).catch((err)=>{
        console.log(err)
    
    })   
}

module.exports=conncetDataBase;


