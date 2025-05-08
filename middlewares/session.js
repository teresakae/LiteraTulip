const session = require("express-session");
const MongoStore = require("connect-mongo");

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-super-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost:27017/uts_pbw",
    collectionName: "sessions",
  }),
  cookie: {
    httpOnly: true,
    secure: false, // Important for local HTTP
    sameSite: "lax",
  },
});

module.exports = sessionMiddleware;
