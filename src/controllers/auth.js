const { user } = require('../../models')

const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    const data = req.body;

    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required(),
        gender: Joi.string().min(4).required(),
        phone: Joi.string().min(10).required(),
        address: Joi.string().min(3).required(),
        subscribe: Joi.boolean(),
    })

    const { error } = schema.validate(req.body)
    if (error) {
        console.log(error);
        return res.status(400).send({
            error: {
                status: "Validation Failed",
                message: error.details[0].message
            }
        })
    }

    // Email sudah terdaftar
    const emailExist = await user.findOne({
        where: {
            email: req.body.email
        }
    })
    if (emailExist) {
        return res.status(401).send({
            status: "error",
            message: "email already exist"
        });
    }

    // Phone sudah terdaftar
    const phoneExist = await user.findOne({
        where: {
            phone: data.phone
        }
    })
    if (phoneExist) {
        return res.status(401).send({
            status: "error",
            message: "phone number already exist"
        })
    }

    try {
        // we generate salt (random value) with 10 rounds
        const salt = await bcrypt.genSalt(10)
        // we hash password from request with salt
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = await user.create({
            ...data,
            subscribe: false,
            status: "customers",
            password: hashedPassword,
        })

        const token = jwt.sign({ id: newUser.id }, process.env.TOKEN_KEY)
        console.log('token', token);

        res.status(201).send({
            status: 'success',
            message: "Register success",
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                subscribe: newUser.subscribe,
                token,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

exports.login = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required(),
    })

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).send({
            error: {
                message: error.details[0].message
            }
        })
    }

    try {
        const userExist = await user.findOne({
            where: {
                email: req.body.email
            },
            attributes: {
                exclude: ["createdAt", "updatedAt"]
            }
        })
        if (!userExist) {
            return res.status(400).send({
                status: 'failed',
                message: 'email doesnt exist'
            })
        }

        const isValid = await bcrypt.compare(req.body.password, userExist.password)
        if (!isValid) {
            return res.status(400).send({
                status: 'failed',
                message: 'Credential is invalid'
            })
        }

        const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY)

        res.status(200).send({
            status: 'success',
            message: "Berhasil Login",
            data: {
                id: userExist.id,
                name: userExist.name,
                email: userExist.email,
                status: userExist.status,
                transaction: userExist.transaction,
                subscribe: userExist.subscribe,
                token,
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

exports.checkAuth = async (req, res) => {
    try {
        const id = req.user.id;

        const dataUser = await user.findOne({
            where: {
                id,
            },
            attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
            },
        });

        if (!dataUser) {
            return res.status(404).send({
                status: "Failed",
            });
        }


        return res.status(200).send({
            status: 'success',
            data: {
                user: {
                    id: dataUser.id,
                    name: dataUser.name,
                    email: dataUser.email,
                    status: dataUser.status,
                    transaction: dataUser.transaction,
                    subscribe: dataUser.subscribe,
                    // image: dataUser.image
                }
            }
        })
    } catch (error) {
        console.log(error);
        res.send({
            status: "failed",
            message: "Server Error",
        })
    }
}