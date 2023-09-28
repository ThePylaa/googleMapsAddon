const puppeteer = require("puppeteer");
require("dotenv").config();
const fs = require("fs");

// scrapes the speed cameras from the website
async function scrape() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.antenne.de/service/aktuelle-blitzer");

  const rawContent = await page.content();

  await fs.writeFile("content.txt", rawContent, (err) => {
    if (err) throw err;
  });

  await browser.close();
  console.log("Finished Scraping");
}

// gets the speed cameras from the scraped data
// and writes them to a json file
async function getSpeedCameras() {
  await scrape();

  const rawContent = fs.readFileSync("content.txt", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    return data;
  });

  const coordinateRegex = new RegExp(
    "\\d{1,2}\\.\\d{6},\\d{1,2}\\.\\d{6}",
    "g"
  );
  const coordinates = rawContent.match(coordinateRegex);

  const speedLimitRegEx = new RegExp("\\d{2,3}(?= km\\/h)", "g");
  const speedLimits = rawContent.match(speedLimitRegEx);

  fs.writeFile("speedCameraData.json", "", (err) => {
    if (err) throw err;
  });

  let splitCoordinates = [];
  for (let i = 0; i < Object.keys(coordinates).length; i++) {
    splitCoordinates.push(coordinates[i].split(","));

    if (i == Object.keys(coordinates).length - 1) {
      await fs.appendFileSync(
        "speedCameraData.json",
        "{\n" +
          '\t"lat":' +
          splitCoordinates[i][0] +
          ',\n\t"lng":' +
          splitCoordinates[i][1] +
          ',\n\t"speed":' +
          speedLimits[i] +
          "\n}\n]",
        function (err) {
          if (err) throw err;
        }
      );
    } else if (i == 0) {
      await fs.appendFileSync(
        "speedCameraData.json",
        "[\n{\n" +
          '\t"lat":' +
          splitCoordinates[i][0] +
          ',\n\t"lng":' +
          splitCoordinates[i][1] +
          ',\n\t"speed":' +
          speedLimits[i] +
          "\n},\n",
        function (err) {
          if (err) throw err;
        }
      );
    } else {
      await fs.appendFileSync(
        "speedCameraData.json",
        "{\n" +
          '\t"lat":' +
          splitCoordinates[i][0] +
          ',\n\t"lng":' +
          splitCoordinates[i][1] +
          ',\n\t"speed":' +
          speedLimits[i] +
          "\n},\n",
        function (err) {
          if (err) throw err;
        }
      );
    }
  }
  var lengthOfFile = Object.keys(coordinates).length;
  return lengthOfFile;
}

// delete all cameras as admin
async function deleteCameras() {
  var detailsAdminUser = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    scope: "admin",
  };
  let token;

  var formBodyAdminAndUser = [];

  // This function converts the details object to a form body
  for (var property in detailsAdminUser) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(detailsAdminUser[property]);
    formBodyAdminAndUser.push(encodedKey + "=" + encodedValue);
  }
  formBodyAdminAndUser = formBodyAdminAndUser.join("&");

  //gets the token
  try {
    const response = await fetch(process.env.API_IP + "/user/signIn", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBodyAdminAndUser,
    });

    if (response.ok) {
      const data = await response.json();
      token = data.access_token;
    }
  } catch (error) {
    console.error("Cant sign in:", error);
  }

  //deletes all cameras
  try {
    const res = await fetch(process.env.API_IP + "/admin/deleteAllCamera", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: "bearer " + token,
      },
    });
  } catch (error) {
    console.error("Cant delete cameras:", error);
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log("Deleted all Cameras");
}

// sends the speed cameras to the server
async function sendToServer() {
  let lengthOfFile = await getSpeedCameras();
  await deleteCameras();
  const jsonData = fs.readFileSync(
    "speedCameraData.json",
    "utf8",
    (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
  console.log("Sending to Server");

  data = JSON.parse(jsonData);
  for (let i = 0; i < lengthOfFile; i++) {
    const res = await fetch(process.env.API_IP + "/camera/addCamera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data[i]),
    });
    console.log("Sent " + i + " of " + lengthOfFile + " to Server");
  }
  console.log("Finished sending");
}

// starts the scraper and sends the data to the server every 15 minutes
async function startScraper() {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 150000));
    await sendToServer();
    console.log("Waiting 17,5 minutes");
    await new Promise((resolve) => setTimeout(resolve, 900000));
  }
}

startScraper();
