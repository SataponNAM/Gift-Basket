const User = require('../models/userModels.jsx')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// Login POST Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // request not have email and password
    if( !email || !password) {
        return res.status(400).json({ message: 'All fields are required.'})
    }

    const foundUser = await User.findOne({ email }).exec()

    // not found user
    if(!foundUser){
        return res.status(401).json({ message: 'Unauthorized'})
    }

    const match = await bcrypt.compare(password, foundUser.password)

    // password not match ot not correct
    if(!match) {
        return res.status(401).json({message: 'Unauthorized'})
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": foundUser.email,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_JWT_SECRET,
        {expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
        { "email": foundUser.email },
        process.env.REFRESH_JWT_SECRET,
        { expiresIn: '1d'}
    )
    
    // create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry 7 days
    })

    // send accessToken contain email and roles
    res.json({ accessToken })
})

// Refresh GET Public
// access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    // not have cookies
    if(!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized'})
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_JWT_SECRET,
        asyncHandler(async (err, decoded) => {
            if(err) {
                return res.status(403).json({message: 'Forbidden'})
            }

            const foundUser = await User.findOne({ email: decoded.email})

            // not found user
            if(!foundUser){
                return res.status(401).json({ message: 'Unauthorized'})
            }

            // found user
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_JWT_SECRET,
                { expiresIn: '15m'}
            )

            res.json({ accessToken })
        })
    )
}

// Logout POST Public
// clear cookie
const logout = (req, res) => {
    const cookies = req.cookies

    if(!cookies?.jwt){
        return res.sendStatus(204)
    }

    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
    })

    res.json({ message: 'Cookie cleared' })
}

module.exports = {
    login,
    refresh,
    logout
} 