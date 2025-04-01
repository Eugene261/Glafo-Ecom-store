const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const user = require("../models/user.js");





// @route POST /api/users/register
// @desc Register a new user
// @access Public
const register = async(req, res) =>{
    const { name, email, password } = req.body;
  
    console.log(req.body); // Log the request body
  
    try {
      // Registration Logic
      let user = await User.findOne({ email });
  
      if (user) return res.status(400).json({ message: "User already exists" });
  
      user = new User({ name, email, password });
      await user.save();
  
    //   Create JWT Payload
    const payload = {user: { id: user._id , role: user.role }};

    // Sign and return the token along with the user data
    jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "40h"}, (err, token) =>{
        if(err) throw err;

        // Send the userand token in Response
        res.status(201).json({
            user: {
                _id : user._id,
                name : user.name,
                email : user.email,
                role : user.role,
            },
            token,  
        })
    });

    

    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
};


// @route POST /api/users/login
// @desc Authenticate user
// @access Public
const login = async(req, res) => {
    const {email, password} = req.body;

    try {
        // Find user by email

        let user = await User.findOne({email});

        if(!user) return res.status(400).json({message : 'Invalid credentials'});

        const isMatch = await user.matchPassword(password);

        if(!isMatch) return res.status(400).json({message : "Invalid credentials"});


        //   Create JWT Payload
        const payload = {user: { id: user._id , role: user.role }};

        // Sign and return the token along with the user data
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "40h"}, (err, token) =>{
            if(err) throw err;

            // Send the userand token in Response
            res.json({
                user: {
                    _id : user._id,
                    name : user.name,
                    email : user.email,
                    role : user.role,
                },
                token,  
            })
        });



    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
        
    }
};


// @route GET /api/users/profile
// @desc Get the logged in users profile (Protected Route)
// @access Private
const getUserProfile = async(req, res) => {
    res.json(req.user);
};

module.exports = {
    register,
    login,
    getUserProfile
};