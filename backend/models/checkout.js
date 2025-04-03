const mongoose = require('mongoose');

const checkoutItemsSchema = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required : true,
    },
    name : {
        type : String,
        required : true,
    },
    image : {
        type : String,
        required : true,
    },
    price : {
        type : Number,
        required : true,
    },
    quantity : {
        type : Number,
        required : true,
    },
    size : {
        type : String,
        required : true,
    },
    color : {
        type : String,
        required : true,
    },
},
{_id : false}
);

const checkoutSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    checkoutItems : [checkoutItemsSchema],
    shippingAddress : {
        address : {type: String, required : true},
        city : {type: String, required : true},
        postalCode : {type: String, required : true},
        country : {type: String, required : true},
        additionalDetails: {
            firstName: {type: String},
            lastName: {type: String},
            phone: {type: String}
        }
    },
    paymentMethod : {
        type : String,
        required : true,
    },
    totalPrice : {
        type : Number,
        required : true,
    },
    isPaid : {
        type : Boolean,
        default : false,
    },
    paidAt : {
        type : Date, 
    },
    paymentStatus : {
        type : String,
        default : "pending",
    },
    paymentDetails : {
        type : mongoose.Schema.Types.Mixed, // store payment-related details(transaction ID, Paypal response)
    },
    isFinalized : {
        type : Boolean,
        default : false, 
    },
    finalizedAt : {
        type : Date
    },

},
{timestamps : true}
);

module.exports = mongoose.model("Checkout", checkoutSchema);