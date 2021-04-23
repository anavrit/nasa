require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000
let randomSpirit, randomOpportunity;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/manifest/curiosity', async (req, res) => {
  try {
    let curiosity = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send( { curiosity })
  } catch (err) {
    console.log('error:', err)
  }
})

app.get('/curiosity', async (req, res) => {
  try {
    let sol = maxsol()
    let curiosity = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=3096&api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send( { curiosity })
  } catch (err) {
    console.log('error:', err)
  }
})

app.get('/manifest/opportunity', async (req, res) => {
  try {
    let opportunity = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/Opportunity/?api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send( { opportunity })
  } catch (err) {
    console.log('error:', err)
  }
})

app.get('/opportunity', async (req, res) => {
  try {
    randomOpportunity = Math.floor(Math.random() * 5111)
    let opportunity = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?sol=${randomOpportunity}&api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send( { opportunity })
  } catch (err) {
    console.log('error:', err)
  }
})

app.get('/manifest/spirit', async (req, res) => {
  try {
    let spirit = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit/?api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send( { spirit })
  } catch (err) {
    console.log('error:', err)
  }
})

app.get('/spirit', async (req, res) => {
  try {
    randomSpirit = Math.floor(Math.random() * 2208)
    let spirit = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?sol=${randomSpirit}&api_key=${process.env.API_KEY}`)
        .then(res => res.json())
        res.send( { spirit })
  } catch (err) {
    console.log('error:', err)
  }
})

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
