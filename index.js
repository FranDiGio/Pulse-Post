import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { ref, set, child, get, update } from 'firebase/database'
import { getFormattedDateTime } from './services/dateService.js'
import { validateSignUp, checkValidUsername } from './services/userService.js'
import { fileURLToPath } from 'url'
import { db, auth } from './config/firebaseConfig.js'
import { dirname } from 'path'
import { User } from './models/User.mjs'
import { ensureAuthenticated } from './services/authService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(
    session({
        secret: '9qB7n!4@F#5ZwpUJ*3Hg',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: 'auto',
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
)

app.listen(port, () => {
    console.log('Listening to port ' + port)
})

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.get('/feed/', ensureAuthenticated, (req, res) => {
    res.render('feed.ejs', { username: req.session.username })
})

app.get('/about/', (req, res) => {
    res.render('about.ejs')
})

app.get('/contact/', (req, res) => {
    res.render('contact.ejs')
})

app.get('/signup/', (req, res) => {
    res.render('sign-up.ejs', {
        success: false,
        invalidUsername: false,
        invalidEmail: false,
        invalidPassword: false,
    })
})

app.get('/login/', (req, res) => {
    res.render('log-in.ejs', { invalidCredentials: false })
})

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body
    const newUser = new User(username, email, password)

    try {
        const usernameError = await checkValidUsername(username)
        if (usernameError) throw new Error(usernameError)

        // Create user in firebase auth database
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        req.session.username = username
        req.session.userId = user.uid

        // Create user in realtime database
        await set(ref(db, 'users/' + user.uid), {
            username: username,
            bio: "I'm new here! be nice ;-;",
            profilePicture: 'N/A',
            createdAt: getFormattedDateTime(),
            lastLogged: getFormattedDateTime(),
        })

        res.render('sign-up.ejs', { success: true })
    } catch (error) {
        const validationResult = await validateSignUp(newUser, error.code)
        res.render('sign-up.ejs', {
            success: false,
            ...validationResult.invalidFields,
            ...validationResult.invalidMessages,
            username,
            email,
        })
        console.log(error.message)
    }
})

app.post('/api/login', (req, res) => {
    const { email, password } = req.body

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Logged In
            const user = userCredential.user
            const usersRef = ref(db, 'users/' + user.uid)

            update(usersRef, {
                lastLogged: getFormattedDateTime(),
            })

            get(child(usersRef, `username`)).then((snapshot) => {
                if (snapshot.exists()) {
                    req.session.username = snapshot.val()
                    req.session.userId = user.uid
                    res.redirect('/feed/')
                } else {
                    console.log('No data available')
                    res.redirect('/login')
                }
            })
        })
        .catch((error) => {
            res.render('log-in.ejs', {
                invalidCredentials: true,
                email: email,
            })
            console.log(error.message)
        })
})

app.post('/api/signout', (req, res) => {
    // Express log-out
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Unable to sign out')
        }
        // Firebase log-out
        signOut(auth).then(() => {
            console.log('Sign-out successful')
        })
        res.redirect('/login')
    })
})

app.post('/api/submit/post', ensureAuthenticated, async (req, res) => {
    const { title, content } = req.body
    const userId = req.session.userId

    await set(ref(db, 'users/' + userId + '/posts/'), {
        title: title,
        content: content,
        createdAt: getFormattedDateTime(),
    })

    res.redirect('/feed')
})
