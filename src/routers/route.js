const route = require("express").Router()
const apiRoute = require("./api/route")

// common api url
const baseUrl = "/api"
// localhost:4000/api
route.use(baseUrl,apiRoute)

module.exports = route