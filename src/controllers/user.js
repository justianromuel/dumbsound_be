const { user } = require('../../models')

// exports.addUsers = async (req, res) => {
//     try {
//         await user.create(req.body)

//         res.status(200).send({
//             status: 'success',
//             message: 'Add user success',
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             status: 'failed',
//             message: 'Server Error',
//         })
//     }
// }

exports.getUsers = async (req, res) => {
    try {
        const users = await user.findAll({
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            }
        })

        res.status(200).send({
            status: 'success',
            users,
        })
    } catch (error) {
        console.status(404).log(error);
        res.send({
            status: 'failed',
            message: 'Server Error',
        })
    }
}

exports.getUser = async (req, res) => {
    try {
        const { id } = req.params
        const data = await user.findOne({
            where: { id },
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            }
        })

        data = JSON.parse(JSON.stringify(data));

        res.status(200).send({
            status: 'success',
            message: `Get User ${id} Success `,
            user: data,
        })
    } catch (error) {
        console.log(error);
        res.status(404).send({
            status: 'failed',
            message: 'Server Error',
        })
    }
}