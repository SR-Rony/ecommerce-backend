const seedRoute = require("express").Router()
const seedUser = require("../../controller/seedUser.controller");


seedRoute.get("/",seedUser)

module.exports = seedRoute;