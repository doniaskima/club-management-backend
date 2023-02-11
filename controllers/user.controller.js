require("dotenv").config();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { extend } = require("lodash");


const login = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).catch((err) => {
        console.log(err);
    });
    if (user) {
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const token = jwt.sign({ id: user._id, name: user.name },
                process.env.JWT_SECRET
            );
            return res.json({
                success: true,
                message: "Login Successful",
                user: user,
                token: token,
            });
        }
        return res.json({
            token: null,
            user: null,
            success: false,
            message: "Wrong password, please try again",
        });
    }
    return res.json({
        token: null,
        user: null,
        success: false,
        message: "No account found with entered email",
    });
};

const signup = async(req, res) => {
    const { name, username, email, password } = req.body;
    let user = await User.findOne({ email: email }).catch((err) => {
        console.log(err);
    });
    if (user) {
        return res.json({
            token: null,
            user: null,
            success: false,
            message: "Account with email already exists, Try logging in instead!",
        });
    }
    user = await User.findOne({ username: username }).catch((err) => {
        console.log(err);
    });
    if (user) {
        return res.json({
            token: null,
            user: null,
            success: false,
            message: "Account with username already exists",
        });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: hashedPassword,
            bio: "Hi there!  welcome to Donia's Twitter clone",
            profileUrl: "https://res.cloudinary.com/formula-web-apps/image/upload/v1623766149/148-1486972_mystery-man-avatar-circle-clipart_kldmy3.jpg",
        });

        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id, name: savedUser.name },
            process.env.JWT_SECRET
        );

        return res.json({
            user: savedUser,
            token: token,
            success: true,
            message: "Signed up successfully",
        });
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            user: null,
            token: null,
            message: err.message,
        });
    }
};
module.exports = {
    login,
    signup,
};