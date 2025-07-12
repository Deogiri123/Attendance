import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";



const createToken = (id) => {
    return  jwt.sign({ id }, process.env.JWT_SECRET)
}


// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false, 
                message: "Email and password are required"
            });
        }

        const user = await userModel.findOne({email});

        if (!user) {
            return res.status(401).json({
                success: false, 
                message: "User doesn't exist"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.status(200).json({
                success: true, 
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({
                success: false, 
                message: "Invalid credentials"
            });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false, 
            message: "Internal server error"
        });
    }
}


// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false, 
                message: "Name, email and password are required"
            });
        }

        // Checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(409).json({
                success: false, 
                message: "User already exists"
            });  
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false, 
                message: "Please enter a valid email"
            });              
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false, 
                message: "Please enter a strong password (minimum 8 characters)"
            });              
        }

        // hashing user Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save();

        const token = createToken(user._id);

        res.status(201).json({
            success: true, 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false, 
            message: "Internal server error"
        });
    }
}


export {
    loginUser,
    registerUser
}