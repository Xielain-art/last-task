import Users from '../models/UserModel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: ['id', 'name', 'email']
        })
        res.json(users)
    } catch (error) {
        console.log(error)
    }
}

export const Register = async (req, res) => {
    const {name, email, password, confPassword} = req.body
    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(password, salt)
    try {
        await Users.create({
            name,
            email,
            password: hashPassword
        })
        return res.json({msg: 'Registration Successful'})
    } catch (error) {
        console.log(error)
    }
}

export const Login = async (req, res) => {
    try {

        const user = await Users.findOne({
            where: {
                email: req.body.email,
            }
        })
        const match = await bcrypt.compare(req.body.password, user.password)
        if (!match) {
            return res.status(400).json({msg: 'Wrong password'})
        }
        const userId = user.id
        const name = user.name
        const email = user.email
        const accessToken = jwt.sign({userId, name, email}, process.env.SECRET_KEY, {
            expiresIn: '15s'
        })
        const refreshToken = jwt.sign({userId, name, email}, process.env.SECRET_KEY, {
            expiresIn: '1d'
        })
        await Users.update({refreshToken}, {
            where: {id: userId}
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        return res.json({accessToken})
    } catch (error) {
        res.status(404).json({msg: 'Email not found'})
    }
}

export const Logout = async (req, res) => {
    const {refreshToken} = req.cookies
    if (!refreshToken) {
        return res.sendStatus(204)
    }
    const user = Users.findOne({
        where: refreshToken
    })
    if (!user) {
        return res.sendStatus(204)
    }
    const userId = user.id
    await Users.update({refreshToken: null}, {
        where: {id: userId}
    })
    res.clearCookie('refreshToken')
    return res.sendStatus(200)
}