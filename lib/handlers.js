const fortune = require('./fortune')

exports.home = (req, res) => res.render('home')

exports.about = (req, res) =>
    res.render('about', {fortune: fortune.getFortune()})

exports.notFound = (req, res) => res.render('404')

// Express recognizes the error handler by way of its four
// arguments, so we have to disable ESLint's "no-unused-vars" rule
/* eslint-disable no-unused-vars */
exports.serverError = (err, req, res, next) => res.render('500')
/* eslint-enable no-unused-vars */

exports.newsletterSignup = (req, res) => {
    // we will learn about CSRF later, for now, we just provide a dummy value
    res.render('newsletter-signup', {csrf: 'CSRF token goes here'})
}

exports.newsletterSignupProcess = (req, res) => {
    console.log('Form (form querystring): ' + req.query.form)
    console.log('CSRF token (from hidden form field): ' + req.body._csrf)
    console.log('Name (from visible form field): ' + req.body.name)
    console.log('Email (from visible form field): ' + req.body.email)
    res.redirect(303, '/newsletter-signup/thank-you')
}

exports.newsletterSignupThankYou = (req, res) => res.render('newsletter-signup-thank-you')

exports.newsletter = (req, res) => res.render('newsletter', {csrf: 'CSRF token goes here'})

exports.newsletterArchive = (req, res) => res.render('newsletter-archive')

exports.api = {
    newsletterSignup: (req, res) => {
        console.log('CSRF token (from hidden form field): ' + req.body._csrf)
        console.log('Name (from visible form field): ' + req.body.name)
        console.log('Email (from visible form field): ' + req.body.email)
        res.send({result: 'success'})
    },
}

exports.vacationPhotoContest = (req, res) => {
    const now = new Date()
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth(),
    })
}

exports.vacationPhotoContestProcessThankYou = (req, res) =>
    res.render('contest/vacation-photo-thank-you')

exports.vacationPhotoContestProcess = (req, res, fields, files) => {
    console.log('field data: ', fields)
    console.log('files: ', files)
    res.redirect(303, '/contest/vacation-photo-thank-you')
}