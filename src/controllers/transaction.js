const { transaction, user } = require('../../models')

const midtransClient = require('midtrans-client')
// const nodemailer = require("nodemailer");

exports.addTransaction = async (req, res) => {
    try {
        let data = req.body
        data = {
            id: parseInt(Math.random().toString().slice(3, 8)),
            ...data,
            userId: req.user.id,
            status: "pending",
        }
        console.log("Catch Data: ", data.price);

        // Insert transaction data here ...
        const newData = await transaction.create(data)

        // Get buyer data here ...
        const buyerData = await user.findOne({
            where: {
                id: newData.userId
            },
            attributes: {
                exclude: ["createdAt", "updatedAt", "password"]
            }
        })

        // Create Snap API instance here ...
        let snap = new midtransClient.Snap({
            // Set to true if you want Production Environment (accept real transaction).
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY
        })

        // Create parameter for Snap API here ...
        let parameter = {
            transaction_details: {
                order_id: newData.id,
                gross_amount: data.price
            },
            credit_card: {
                secure: true
            },
            customer_details: {
                full_name: buyerData?.name,
                email: buyerData?.email,
                phone: buyerData?.phone
            }
        }

        // Create trasaction token & redirect_url with snap variable here ...
        const payment = await snap.createTransaction(parameter);
        console.log(payment);

        res.send({
            status: "pending",
            message: "Pending transaction payment gateway",
            payment,
        })
    } catch (error) {
        console.log(error);
        res.status(404).send({
            status: "payment failed",
            message: "Server Error",
        })
    }
}

// Configurate midtrans client with CoreApi
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY,
});

/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */

// Create function for handle https notification / WebHooks of payment status here ...
exports.notification = async (req, res) => {
    try {
        console.log("notification", req.body);
        const statusResponse = await core.transaction.notification(req.body);
        const orderId = statusResponse.order_id; // id transaksi
        const transactionStatus = statusResponse.transaction_status; //status transaction database
        const fraudStatus = statusResponse.fraud_status; //status transaction midtrans

        console.log(statusResponse);
        console.log("paymentType1", statusResponse?.payment_type);
        console.log("paymentType2", statusResponse?.notification);

        if (transactionStatus == "capture") {
            if (fraudStatus == "challenge") {
                // TODO set transaction status on your database to 'challenge'
                // and response with 200 OK
                // sendEmail("pending", orderId);
                updateTransaction("pending", orderId, false, statusResponse?.payment_type);
                res.status(200);
            } else if (fraudStatus == "accept") {
                // TODO set transaction status on your database to 'success'
                // and response with 200 OK
                // sendEmail("success", orderId);
                updateTransaction("success", orderId, true, statusResponse?.payment_type, statusResponse?.transaction_time, statusResponse?.gross_amount);
                res.status(200);
            }
        } else if (transactionStatus == "settlement") {
            // TODO set transaction status on your database to 'success'
            // and response with 200 OK
            // sendEmail("success", orderId);
            updateTransaction("success", orderId, true, statusResponse?.payment_type, statusResponse?.transaction_time, statusResponse?.gross_amount);
            res.status(200);
        } else if (transactionStatus == "cancel" || transactionStatus == "deny" || transactionStatus == "expire") {
            // TODO set transaction status on your database to 'failure'
            // and response with 200 OK
            // sendEmail("failed", orderId);
            updateTransaction("failed", orderId, false, statusResponse?.payment_type);
            res.status(200);
        } else if (transactionStatus == "pending") {
            // TODO set transaction status on your database to 'pending' / waiting payment
            // and response with 200 OK
            // sendEmail("pending", orderId);
            updateTransaction("pending", orderId, false, statusResponse?.payment_type);
            res.status(200);
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};

exports.getTransactions = async (req, res) => {
    try {
        let data = await transaction.findAll({
            include: {
                model: user,
                as: "user",
                attributes: {
                    exclude: ["createdAt", "updatedAt", "password"],
                },
            },
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
            order: [["createdAt", "DESC"]],
        });

        console.log("GET TRANSACTIONS: ", data);

        // data = JSON.parse(JSON.stringify(data));

        res.status(200).send({
            status: "Get data Transaction Success",
            data,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            status: "Get data Transactions Failed",
            message: "Server Error",
        });
    }
}

exports.getTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        let data = await transaction.findOne({
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
            where: {
                id,
            },
        });
        res.status(200).send({
            status: "Get data Transaction Success",
            data,
        });
    } catch (error) {
        console.log(error);
        res.status(404).send({
            status: "Get data Transactions Failed",
            message: "Server Error",
        });
    }
}

// exports.deleteTransaction = async (req, res) => {
//     const { id } = req.params;
//     console.log(id);
//     try {
//         await transaction.destroy({
//             where: {
//                 id,
//             },
//         });

//         res.status(200).send({
//             status: "Delete Transaction Success",
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(404).send({
//             status: "Delete Transactions Failed",
//             message: "Server Error",
//         });
//     }
// }

// Create function for handle transaction update status
const updateTransaction = async (status, transactionId, subscribe, paymentMethod, startDate, grossAmount) => {
    try {
        await transaction.update(
            {
                status,
                paymentMethod,
            },
            {
                where: {
                    id: transactionId,
                },
            }
        );

        // Kondisi untuk menentukan durasi
        let dueDate;
        if (grossAmount) {
            if (grossAmount === "20000") {
                dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + 30);

                await transaction.update(
                    {
                        startDate,
                        dueDate,
                    },
                    {
                        where: {
                            id: transactionId,
                        },
                    }
                );
            } else if (grossAmount === "100000") {
                dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + 180);

                await transaction.update(
                    {
                        startDate,
                        dueDate,
                    },
                    {
                        where: {
                            id: transactionId,
                        },
                    }
                );
            } else if (grossAmount === "180000") {
                dueDate = new Date(startDate);
                dueDate.setDate(dueDate.getDate() + 360);

                await transaction.update(
                    {
                        startDate,
                        dueDate,
                    },
                    {
                        where: {
                            id: transactionId,
                        },
                    }
                );
            }
        }
        // Get transaksi untuk update user
        const getUserId = await transaction.findOne({
            where: {
                id: transactionId,
            },
        });

        await user.update(
            { subscribe: subscribe },
            {
                where: {
                    id: getUserId.userId,
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
};

// Handle send email
// const sendEmail = async (status, transactionId) => {
//     // Config service and email account
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.SYSTEM_EMAIL,
//             pass: process.env.SYSTEM_PASSWORD,
//         },
//     });

//     // Get transaction data
//     let data = await transaction.findOne({
//         where: {
//             id: transactionId,
//         },
//         attributes: {
//             exclude: ["createdAt", "updatedAt", "password"],
//         },
//         include: [
//             {
//                 model: user,
//                 as: "user",
//                 attributes: {
//                     exclude: ["createdAt", "updatedAt", "password", "status"],
//                 },
//             },
//             // {
//             //   model: product,
//             //   as: "product",
//             //   attributes: {
//             //     exclude: ["createdAt", "updatedAt", "idUser", "qty", "price", "desc"],
//             //   },
//             // },
//         ],
//     });

//     data = JSON.parse(JSON.stringify(data));

//     console.log("Buyer: ", data);

//     // Email options content
//     const mailOptions = {
//         from: process.env.SYSTEM_EMAIL,
//         to: data?.buyer?.email,
//         subject: "Payment status",
//         text: "Your payment is <br />",
//         html: `<!DOCTYPE html>
//             <html lang="en">
//               <head>
//                 <meta charset="UTF-8" />
//                 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                 <title>Document</title>
//                 <style>
//                   h1 {
//                     color: brown;
//                   }
//                 </style>
//               </head>
//               <body>
//                 <h2>Product payment :</h2>
//                 <ul style="list-style-type:none;">
//                 </ul>
//               </body>
//             </html>`,
//     };

//     // Send an email if there is a change in the transaction status
//     if (data.status != status) {
//         transporter.sendMail(mailOptions, (err, info) => {
//             if (err) throw err;
//             console.log("Email sent: " + info.response);

//             return res.send({
//                 status: "Success",
//                 message: info.response,
//             });
//         });
//     }
// };