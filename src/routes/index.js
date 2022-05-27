const express = require('express')
const router = express.Router()

// Controller:
const { getUsers, getUser } = require('../controllers/user')
const { register, login, checkAuth } = require('../controllers/auth')
const { addArtis, getArtiss, getArtis } = require('../controllers/artis')
const { addMusic, musics, getMusic } = require('../controllers/music')
const { notification, getTransactions, addTransaction, getTransaction } = require('../controllers/transaction')

// Middleware:
// Auth
const { auth } = require('../middlewares/auth')

// Upload File
const { uploadFile } = require('../middlewares/uploadFile')

// Route:
// Login & Register
router.post("/register", register)
router.post("/login", login)
router.get("/check-auth/", auth, checkAuth)

// User
router.get('/users', getUsers)
router.get('/user/:id', getUser)

// Artist
router.post("/add-artis", addArtis)
router.get("/artis", getArtiss)
router.get("/artis/:id", getArtis)

// Music
router.post("/add-music", uploadFile("thumbnail", "attache"), addMusic);
router.get("/musics", musics);
router.get("/music/:id", getMusic);

// Transaction
router.get("/transactions", auth, getTransactions)
router.get("/transaction/:id", auth, getTransaction)
router.post("/transaction", auth, addTransaction)

// Notification
router.post("/notification", notification);

module.exports = router