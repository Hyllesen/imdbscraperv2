const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: true });

nightmare.viewport(1920, 1080).goto("https://www.airbnb.com/");
