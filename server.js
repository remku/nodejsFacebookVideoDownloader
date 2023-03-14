// setup express
const express = require("express");
const app = express();
const cors = require("cors");
const os = require("os");
const axios = require("axios").default;
const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");
// if not in production import dotenv
const isDevelopment = process.env.NODE_ENV !== "development";
if (isDevelopment) {
  require("dotenv").config();
}
// Get PORT
const PORT = process.env.PORT || 3001;
const hostName = isDevelopment ? "localhost" : os.hostname();

// Setup middlwares
app.use(express.json());
app.use(cors());

// Puppeteer
// const puppeteerFn = async (url) => {
//   const browser = await puppeteer.launch({ headless: true });
//   const newPage = await browser.newPage();

//   await newPage.goto(url);
//   const aTag = await newPage.waitForSelector(".widePic > a");
//   const fullLink = await aTag.evaluate((e) => e.href);

//   const link = decodeURIComponent(
//     fullLink.replace(new RegExp(".+src=", "gi"), "")
//   );

//   return link;
// };

const fetchLink = async (url) => {
  console.log("Func");
  const response = await axios.get(`${url}`, {
    headers: {
      "Accept-Language": "en",
    },
  });
  console.log("response");
  const html = await response.data;
  console.log("html" + html);

  const $ = cheerio.load(html);
  console.log("loaded" + $);
  const fullLink = $("a", ".widePic").attr("href");
  console.log("fullLink" + fullLink);
  const link = decodeURIComponent(
    fullLink.replace(new RegExp(".+src=", "gi"), "")
  );

  console.log(link);

  return link;
};

// API Request
app.post("/getFbVideoLink", async (req, res) => {
  try {
    const { url } = req.body;

    const response = await axios.get(url);
    const directUrl = response.request.res.responseUrl;

    let search = new RegExp("www", "gi");
    let mbasicUrl = directUrl.replace(search, "mbasic");

    if (directUrl.includes("facebook.com/reel/")) {
      mbasicUrl =
        "https://mbasic.facebook.com/watch?v=" +
        directUrl.match(new RegExp("[0-9]+", "g"))[0];
    }

    console.log(mbasicUrl);

    const link = await fetchLink(`${mbasicUrl}`);
    res.json({
      downloadLink: link,
    });
  } catch (err) {
    res.status(404).json({ message: "Video not found" });
  }
});

app.get("/*", (req, res) => {
  res
    .status(404)
    .send("Post request to https://calm-dirndl-bass.cyclic.app/getFbVideoLink");
});
app.post("/*", (req, res) => {
  res
    .status(404)
    .send("Post request to https://calm-dirndl-bass.cyclic.app/getFbVideoLink");
});

app.listen(PORT, () =>
  console.log(`Server started at: http://${hostName}:${PORT}`)
);
