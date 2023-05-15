import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();


mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
}).then(()=> {
    console.log('connected to MongoDB')

}).catch((error)=>{
    console.log(error)
})

const userShecma = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userShecma);

app.use(express.static(path.join(path.resolve(),"public")))
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async(req,res,next)=>{
    const {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token,"dasfdfsdgfsfas");
        req.user = await User.findById(decoded._id);
        next();
    }else
    {
        res.redirect("/login");
    }
}

app.get("/",isAuthenticated,(req,res)=>{
    res.render("logout",{name: req.user.name});
    // res.sendFile("index.html");
});

app.get("/register",(req,res)=>{
    res.render("register");
    // res.sendFile("index.html");
});

app.post("/register",async(req,res)=>{
    const { name,email,password } = req.body;
    let abc = await User.findOne({email});
    if(abc){
        return res.redirect("/login");
    }

    const hashPassword = await bcrypt.hash(password,10);

    const user = await User.create({
        name,email,password:hashPassword,
    });

    const token = jwt.sign({_id:user._id},"dasfdfsdgfsfas");
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
});

app.get("/login",(req,res)=>{
    res.render("login");
    // res.sendFile("index.html");
});

app.post("/login",async(req,res)=>{
    const { email,password } = req.body;
    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    } 

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) return res.render("login",{ email,message:"Incorrect Password"});

    const token = jwt.sign({_id:user._id},"dasfdfsdgfsfas");
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
});

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
    });
    res.redirect("/");
});

app.get("/add",async(req,res)=>{
    
    await Message.create({name:"Alee2",email:"alee2@gmail.com"})
    res.send("Nice !")
});


app.listen(5000,()=>{
    console.log("Server is running")
});
