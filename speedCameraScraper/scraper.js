const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()

    await page.goto("https://www.antenne.de/service/aktuelle-blitzer")
    
    const rawContent = await page.content()



    await fs.writeFile('content.txt', rawContent, (err) => {
        if (err) throw err;
    });
 
    await browser.close()
    console.log("Finished Scraping")
}

async function getSpeedCameras(params) {

    await scrape();

    const rawContent = fs.readFileSync('content.txt', 'utf8', (err, data) => {
        if (err) {
            console.log(err)
            return
        }
        return data
    })
    
    const coordinateRegex = new RegExp('\\d{1,2}\\.\\d{6},\\d{1,2}\\.\\d{6}', "g")
    const coordinates = rawContent.match(coordinateRegex)
    
    const speedLimitRegEx = new RegExp('\\d{2,3}(?= km\\/h)', 'g')
    const speedLimits = rawContent.match(speedLimitRegEx)
    
    fs.writeFile('speedCameraData.json', "", (err) => {
        if (err) throw err;
    });

    let splitCoordinates = []
    for (let i = 0; i < Object.keys(coordinates).length; i++) {
        splitCoordinates.push(coordinates[i].split(','))
        
        if (i == Object.keys(coordinates).length-1) {
            await fs.appendFileSync('speedCameraData.json', "{\n" + "\t\"lat\":" + splitCoordinates[i][0] + ",\n\t\"lng\":" + splitCoordinates[i][1] + ",\n\t\"speed\":" + speedLimits[i] + "\n}\n]", function (err) {
                if (err) throw err;
              });
        }   else if (i == 0) {
            await fs.appendFileSync('speedCameraData.json', "[\n{\n" + "\t\"lat\":" + splitCoordinates[i][0] + ",\n\t\"lng\":" + splitCoordinates[i][1] + ",\n\t\"speed\":" + speedLimits[i] + "\n},\n", function (err) {
                if (err) throw err;
              });
        }else{
            await fs.appendFileSync('speedCameraData.json', "{\n" + "\t\"lat\":" + splitCoordinates[i][0] + ",\n\t\"lng\":" + splitCoordinates[i][1] + ",\n\t\"speed\":" + speedLimits[i] + "\n},\n", function (err) {
                if (err) throw err;
              });
        }
    }
    var lengthOfFile = Object.keys(coordinates).length
    return lengthOfFile
    
}

async function sendToServer() {
    let lengthOfFile = await getSpeedCameras()
    const jsonData= fs.readFileSync('speedCameraData.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err)
            return
        }
        
    })

    console.log("Sending to Server")
    
    data = JSON.parse(jsonData)
    for (let i = 0; i < lengthOfFile; i++) {
        const res = await fetch('http://mosers-it.de:23451/camera/addCamera', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data[i])
        })
        console.log("Sent " + i + " of " + lengthOfFile + " to Server")
    }
    console.log("Finished sending")
}

while(true) {
    sendToServer()
    await new Promise(resolve => setTimeout(resolve, 3600000));
}

