const http = require("http");
const fs = require("fs");
var requests = require("requests");
const port = process.env.PORT || 8000;
const homeFile = fs.readFileSync("home.html", "UTF-8");

const replaceVal = (tempVal, orgVal) => {
    let temperature = tempVal.replace("{%tempVal%}", Math.round(orgVal.main.temp - 273.15));      //temperature was in Kelvin
    temperature = temperature.replace("{%tempMin%}", Math.round(orgVal.main.temp_min - 273.15));  //0°C = 273.15K
    temperature = temperature.replace("{%tempMax%}", Math.round(orgVal.main.temp_max - 273.15));
    temperature = temperature.replace("{%country%}", orgVal.sys.country);
    temperature = temperature.replace("{%location%}", orgVal.name);
    temperature = temperature.replace("{%tempStatus%}", orgVal.weather[0].main)
    return temperature;
}

const server = http.createServer((req, res) => {
    if (req.url == "/") {
        requests(
            "http://api.openweathermap.org/data/2.5/weather?q=london&appid=7ebfe6a5aef7aefa3e5524f5a9fa97eb"
        )
            .on("data", (chunk) => {
                const objData = JSON.parse(chunk);
                const arrData = [objData];
                const realTimeData = arrData
                    .map((val) => replaceVal(homeFile, val))
                    .join("");       // used join to convert array into string by joining all the elements of array
                res.write(realTimeData);
                // console.log(realTimeData);
            })
            .on("end", (err) => {
                if (err) return console.log("connection closed due to errors", err);
                res.end();
            });
    }
});
server.listen(port);
