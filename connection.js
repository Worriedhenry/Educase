var mysql=require('mysql');
require('dotenv').config();
var connection=mysql.createConnection({
    host:process.env.SERVER,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
});
connection.connect((err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log('connected');
    }
});


module.exports=connection;