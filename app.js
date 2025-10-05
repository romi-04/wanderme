if (process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express= require("express");
const app=express();
const mongoose= require("mongoose");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy= require("passport-local");
const User=require("./models/user.js");

const dburl=process.env.ATLASDB_URL;


const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

main()
    .then(()=>{
        console.log("connected to DB");
    }) 
    .catch((err)=>{
        console.log(err);
    });

async function main() {
    await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL || process.env.MONGO_URL,
  touchAfter: 24 * 3600, // lazy session update (in seconds)
  crypto: {
    secret: process.env.SECRET,
  }
});

store.on("error",()=>{
    console.log("Error in mongo session store", err);
});

const sessionOptions={
    store, 
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },

};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use("/listings",listingsRouter);

app.use("/listings/:id/reviews",reviewsRouter);
app.use("/", userRouter);


app.use((req, res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
});
app.use((err, req, res, next)=>{
    let{statusCode=500, message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});