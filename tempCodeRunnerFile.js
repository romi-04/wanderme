const express= require("express");
const app=express();
const mongoose= require("mongoose");
const Listing = require("./models/listing.js");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync =require("./utils/wrapasync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}=require("./schema.js");
const Review = require("./models/review.js");

const listings=require("./routes/listing.js")



const mongo_url= "mongodb://127.0.0.1:27017/wanderme";

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongo_url);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});





const validateReview=(req, res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg );
    }
    else{
        next();
    }
};

app.use("/listings",listings);

//reviews
//post route
app.post("/listings/:id/reviews",validateReview, wrapAsync(async(req, res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//delete review date
