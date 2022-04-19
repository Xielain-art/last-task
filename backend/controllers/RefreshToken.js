import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import e from "express";


export const refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.cookies
        if (!refreshToken) {
            return res.sendStatus(401)
        }
        const user = await Users.findOne({
            where: {
                refresh_token: refreshToken
            }
        })
        if (!user) {
            return res.sendStatus(403)
        }
        jwt.verify(refreshToken, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.sendStatus(403)
            }
            const userId = user.id
            const name = user.name
            const email = user.email
            const accessToken = jwt.sign({userId, name, email}, process.env.SECRET_KEY, {
                expiresIn: '15s'
            })
            return res.json({accessToken})
        })
    } catch (error) {
        console.log(error)
    }

}