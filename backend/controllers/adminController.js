const User = require('../models/user.js');




// @rout GET /api/admin/users
// @desc Get all users (Admin only)
// @access Private
const adminGetUser = async (req, res) => {

    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success :  false,
            message : "Server Error"
        })
        
    }
};

// @rout POST /api/admin/users
// @desc Add a new  user (Admin only)
// @access Private
const adminAddUser = async(req, res) => {
    const {name, email, password, role} = req.body;
    
    
    try {
        let user = await User.findOne({email});
        if(user) {
            return res.status(400).json({ message : "User already exists"})
        }


        user = new User({
            name,
            email,
            password,
            role : role || "customer"
        });


        await user.save();
        res.status(201).json({
            success : true,
            message : "User created successfully",
            data : user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success :  false,
            messagec : "Server Error"
        })
    }
};

// @rout PUT /api/admin/users/:id
// @desc Update a  user info (Admin only) - name, email & prole
// @access Private

const adminUpdateUserInfo = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
        }

        const updatedUser = await user.save();
        res.json({ message : "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success :  false,
            messagec : "Server Error"
        })
    }
};


// @rout DELETE /api/admin/users/:id
// @desc Delete a  user from DB (Admin only) 
// @access Private
const adminDeleteUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user){
            await user.deleteOne();
            res.json({message : "User dleted successfully"});
        } else {
            res.status(404).json({
                success : false,
                message : "User not found!"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success :  false,
            messagec : "Server Error"
        })
    } 
};






module.exports = {
    adminGetUser,
    adminAddUser,
    adminUpdateUserInfo,
    adminDeleteUser
};