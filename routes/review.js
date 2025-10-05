const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync =require("../utils/wrapasync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor}= require("../middleware.js");
const reviewController= require("../controllers/review.js");
//reviews



//post route
router.post("/",
    isLoggedIn, 
    validateReview, 
    wrapAsync(reviewController.postReview));

//delete review date
router.delete("/:reviewId", 
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview));

module.exports = router;