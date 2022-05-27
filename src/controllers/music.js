const { music, artis } = require('../../models')
const cloudinary = require('cloudinary')

exports.addMusic = async (req, res) => {
    try {
        const data = req.body;
        const thumbnail = req.files?.thumbnail[0]?.filename;
        const attache = req.files?.attache[0]?.filename;

        console.log(data);
        console.log(thumbnail);
        console.log(attache);

        const dataUpload = {
            ...data,
            thumbnail,
            attache,
        };

        await music.create(dataUpload);

        res.send({
            status: "success",
            message: "Upload data Music success",
        })
    } catch (error) {
        console.log(error);
        res.status({
            status: "failed",
            message: "Server Error",
        })
    }
}

exports.musics = async (req, res) => {
    try {
        let musics = await music.findAll({
            include: {
                model: artis,
                as: "artis",
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            },
            attributes: {
                exclude: ["createdAt"],
            },
            order: [["createdAt", "DESC"]],
        });

        musics = JSON.parse(JSON.stringify(musics));

        musics = musics.map((item) => {
            return {
                ...item,
                attache: process.env.PATH_FILE + item.attache,
                thumbnail: process.env.PATH_FILE + item.thumbnail,
            };
        });

        console.log(musics);

        res.send({
            status: "success",
            message: "User Successfully Get",
            data: {
                musics,
            },
        });
    } catch (error) {
        console.log(error);
        res.status({
            status: "failed",
            message: "Server Error",
        })
    }
}

exports.getMusic = async (req, res) => {
    try {
        const { id } = req.params

        let data = await music.findOne({
            include: [{
                model: artist,
                as: 'artist',
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }],
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            },
            where: { id }
        });

        data = JSON.parse(JSON.stringify(data))
        // console.log(data)

        data = data.map((item) => {
            return {
                ...item,
                thumbnail: process.env.FILE_PATH + item.thumbnail,
                attache: process.env.FILE_PATH + item.attache
            }
        })

        res.status(200).send({
            status: "success",
            data
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: 'failed',
            message: 'server error'
        })
    }
}

// exports.updateMusic = async (req, res) => {
//     try {
//         const { id } = req.params
//         const data = {
//             title: req.body.title,
//             years: req.body.years,
//             thumbnail: req.file.thumbnail,
//             attache: req.file.attache,
//             artistId: req.body.artistId
//         }
//         await music.update(data, {
//             where: { id },
//             include: [{
//                 model: artist,
//                 as: 'artist',
//                 attributes: {
//                     exclude: ['createdAt', 'updatedAt']
//                 }
//             }],
//             attributes: {
//                 exclude: ['createdAt', 'updatedAt']
//             },
//         });

//         data = JSON.parse(JSON.stringify(data))
//         // console.log(data)

//         data = data.map((item) => {
//             return {
//                 ...item,
//                 thumbnail: process.env.FILE_PATH + item.thumbnail,
//                 attache: process.env.FILE_PATH + item.attache
//             }
//         })

//         res.status(200).send({
//             status: "success",
//             data
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             status: 'failed',
//             message: 'server error'
//         })
//     }
// }

// exports.deleteMusic = async (req, res) => {
//     try {
//         const { id } = req.params
//         await music.destroy({
//             where: { id }

//         })
//         res.status(200).send({
//             status: 'success',
//             message: `Delete music id = ${id} success`
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             status: 'failed',
//             message: 'server error'
//         })
//     }
// }