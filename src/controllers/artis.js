const { artis } = require('../../models')

// const Joi = require('joi')

exports.addArtis = async (req, res) => {
    try {
        //     const schema = Joi.object({
        //         name: Joi.string().min(4).required(),
        //         old: Joi.number().min(1).required(),
        //         type: Joi.string().min(3).required(),
        //         startCareer: Joi.string().min(4).required(),
        //     })

        //     const { error } = schema.validate(req.body)
        //     if (error) {
        //         return res.status(400).send({
        //             message: error.details[0].message
        //         })
        //     }

        //     const newArtist = await artis.create({
        //         name: req.body.name,
        //         old: req.body.old,
        //         type: req.body.type,
        //         startCareer: req.body.startCareer
        //     })

        //     res.status(200).send({
        //         status: 'success',
        //         data: {
        //             name: newArtist.name,
        //             old: newArtist.old,
        //             type: newArtist.type,
        //             startCareer: newArtist.startCareer
        //         }
        //     })
        // } catch (error) {
        //     console.log(error);
        //     res.status(500).send({
        //         status: 'failed',
        //         message: 'server error'
        //     })
        // }
        const { body } = req

        const artisData = await artis.create(body)

        res.send({
            status: 'success',
            message: 'artis Successfully Add',
            data: artisData
        })

    } catch (error) {
        console.log(error)
        res.status({
            status: 'failed',
            message: 'Server Error',
        })
    }
}

exports.getArtiss = async (req, res) => {
    try {
        const artiss = await artis.findAll({
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        });

        res.send({
            status: "success",
            message: "User Successfully Get",
            data: {
                artiss,
            },
        });
    } catch (error) {
        console.log(error);
        res.status({
            status: "failed",
            message: "Server Error",
        });
    }
}

exports.getArtis = async (req, res) => {
    try {
        const { id } = req.params
        const data = await artis.findOne({
            where: { id },
            // attributes: {
            //     exclude: ['createdAt', 'updatedAt']
            // }
        })
        res.status(200).send({
            status: 'success',
            message: `Get Artis ${id} Success`,
            data
        })
    } catch (error) {
        console.log(error);
        res.status({
            status: "failed",
            message: "Server Error",
        })
    }
}

// exports.updateArtis = async (req, res) => {
//     try {
//         const { id } = req.params
//         const { body } = req;
//         console.log(body);
//         const data = await artis.update(body, {
//             where: {
//                 id,
//             },
//         })

//         res.send({
//             status: "success",
//             message: `Update Artis ${id} Success`,
//             data,
//         })
//     } catch (error) {
//         console.log(error);
//         res.status({
//             status: "failed",
//             message: "Server Error",
//         })
//     }
// }

// exports.deleteArtis = async (req, res) => {
//     try {
//         const { id } = req.params
//         await artis.destroy({
//             where: { id }

//         })
//         res.send({
//             status: 'success',
//             message: `Delete artis id = ${id} success`
//         })
//     } catch (error) {
//         console.log(error);
//         res.status({
//             status: "failed",
//             message: "Server Error",
//         })
//     }
// }