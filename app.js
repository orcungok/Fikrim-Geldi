const express = require("express");
const app = express();
const doenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");

doenv.config({
  path: "./.env",
});

const partialsPath = path.join(__dirname, "./views/partials");
hbs.registerPartials(partialsPath);

app.set("views", path.join(__dirname, "views/"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(express.static("node_modules"));

//-----------------------------HANDLEBARS CONFIG---------------------------------------------------//

app.set("view engine", "hbs");

hbs.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
hbs.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (var i = from; i <= to; i += incr) accum += block.fn(i);

  return accum;
});

//-----------------------------HANDLEBARS CONFIG---------------------------------------------------//

app.use("/", require("./routes/sayfalar"));
app.use("/", require("./routes/auth"));
// app.use("/auth", require("./routes/auth"));

const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
app.use(connectLiveReload());


const PORT = process.env.PORT||3307;
app.listen(PORT, () => {
  console.log(`Server started @ ${PORT}`);
});
