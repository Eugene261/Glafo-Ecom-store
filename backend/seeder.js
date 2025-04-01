const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product.js');
const Cart = require('./models/Cart.js');
const products = require('./data/products.js');
const User = require('./models/user.js');



// Connect tp MongoDB 
mongoose.connect(process.env.MONGO_URL);

// Function to seed data
const seedData = async () =>{
    try {
        // Clear the existing data
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        // Create a default admin User
        const createdUser = await User.create({
            name : "Admin User",
            email : "admin@example.com",
            password : "123456",
            role : "admin"
        });


        //  Assign the default user ID to each product
        const userID = createdUser._id


        const sampleProducts = products.map((product) => {
            return {...product, user: userID};
        });


        // Insert the products in the DB
        await Product.insertMany(sampleProducts);

        console.log("Product data seeded successfully!");
        process.exit();
        
    } catch (error) {
        console.error('Error seeding the data:', error);
        process.exit(1);   
    }
};

seedData();
