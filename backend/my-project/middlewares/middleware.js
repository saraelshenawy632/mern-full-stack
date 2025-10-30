const express = require("express");
const cors = require("cors");
const dataMiddleware = express.json();

const corsMiddleware = cors({
origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PATCH","DELETE","OPTIONS","PUT"]

});

module.exports = { dataMiddleware, corsMiddleware };

