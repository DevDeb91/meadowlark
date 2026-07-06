const express = require('express')
const { engine } = require('express-handlebars')

const app = express()

//configure Handlebar view engine
app.engine('handlebars', engine({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

const fortunes = [
    "Conquer your fears or they will conquer you.",
    "Rivers need springs.",
    "Do not fear what you don't know.",
    "You will have a pleasant surprise.",
    "Whenever possible, keep it simple"
]

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    // with handlebars
    res.render('home')
    /* basic displayed text
    res.type('text/plain')
    res.send('Meadowlark Travel')
    */
})

app.get('/about', (req, res) => {
    const randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)]
    // with handlebars
    res.render('about', { fortune: randomFortune })
    /* basic displayed text
    res.type('text/plain')
    res.send('About Meadowlark Travel')
    */
})

// custom 404 page
app.use((req, res) => {
    res.status(404)
    // with handlebars
    res.render('404')
    /* basic displayed text
    res.type('text/plain')
    res.send('404 - Not Found')
    */
})

// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500)
    // with handlebars
    res.render('500')
    /* basic displayed text
    res.type('text/plain')
    res.send('500 - Server Error')
    */
})

app.listen(port, () => console.log(`Express started on http://localhost:${port}; ` + `press Ctrl-C to terminate.`))