const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");

const MONGODB_URI =
  "mongodb+srv://fauzanfebriann:lahat123@cluster0.whp9l.mongodb.net/node-complete?retryWrites=true&w=majority";

const app = express();
const csrf = require("csurf")();
const MongoDBStore = require("connect-mongodb-session")(session);

const checkDB = require("./utils/checkDB");
const multer = require("./middleware/multer");
const setLocals = require("./middleware/setLocals");
const { get404, get500, globalErrorHandling } = require("./controllers/error");
const { admin, shop, auth } = require("./routes");

let dbErr;
const dbErrHandle = (err) => err && (dbErr = err);
const store = new MongoDBStore(
  {
    uri: MONGODB_URI,
    collection: "sessions",
    expires: 1000 * 60 * 60 * 24 * 365,
  },
  dbErrHandle
);
mongoose.connect(MONGODB_URI).catch(dbErrHandle);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));
app.use(multer);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => (dbErr ? next(new Error(dbErr)) : next()));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 },
    store,
  })
);
app.use(csrf, flash());

app.use(setLocals);

app.use("/admin", admin);
app.use(auth);
app.use(shop);

app.use("/500", get500);
app.use(get404);
app.use(globalErrorHandling);

app.listen(3000, () => console.log("Server started at port 3000"));
checkDB();
