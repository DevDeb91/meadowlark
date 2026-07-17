const express = require('express')
const { engine } = require('express-handlebars')
const handlers = require('./lib/handlers')
const weatherMiddleware = require('./lib/middleware/weather')
const bodyParser = require('body-parser')
const multiparty = require('multiparty')
const { credentials } = require('./config')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
const flashMiddleware = require('./lib/middleware/flash')

const app = express()
app.use(cookieParser())
app.use(expressSession({
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: false
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(flashMiddleware)

// Remove the X-Powered-By header for security reasons
app.disable('x-powered-by')

//configure Handlebar view engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if(!this._sections) this._sections = {}
            this._sections[name] = options.fn(this)
            return null
        }
    }
}))
app.set('view engine', 'handlebars')

const port = process.env.PORT || 3000

app.use(weatherMiddleware)

app.use(express.static(__dirname + '/public'))

app.get('/', handlers.home)

app.get('/about', handlers.about)

app.get('/newsletter', handlers.newsletter)
app.post('/api/newsletter-signup', handlers.api.newsletterSignup)
app.get('/newsletter-signup', handlers.newsletterSignup)
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess)

// mock signup "database" object for demonstration purposes;
// here we would normally save to a real database
class NewsletterSignup {
    constructor({ name, email }) {
        this.name = name
        this.email = email
    }
    save(cb) {
        cb()
    }
}

const VALID_EMAIL_REGEX = new RegExp(
    '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$'
)
app.post('/newsletter', function(req, res){
    const name = req.body.name || ''
    const email = req.body.email || ''
    // input validation
    if(!VALID_EMAIL_REGEX.test(email)) {
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.'
        }
        return res.redirect(303, '/newsletter')
    }

    new NewsletterSignup({ name, email}).save((err) => {
        if(err) {
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.'
            }
            return res.redirect(303, '/newsletter/archive')
        }
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.'
        }
        return res.redirect(303, '/newsletter/archive')
    })
})
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou)
app.get('/newsletter/archive', handlers.newsletterArchive)

app.get('/contest/vacation-photo', handlers.vacationPhotoContest)
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
        if(err) return res.status(500).send({error: err.message})
        handlers.vacationPhotoContestProcess(req, res, fields, files)
    })
})
app.get('/contest/vacation-photo-thank-you', handlers.vacationPhotoContestProcessThankYou)

// custom 404 page
app.use(handlers.notFound)

// custom 500 page
app.use(handlers.serverError)

if(require.main === module) {
    app.listen(port, () => console.log(`Express started on http://localhost:${port}; ` + `press Ctrl-C to terminate.`))
} else {
    module.exports = app
}