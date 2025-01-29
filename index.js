require("dotenv/config");
const express = require("express");
const cors = require("cors");
const app = express();
const { url, getFormattedDate } = require("./functions");

const port = process.env.PORT || 4625;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/", async (req, res) => {
  const { lat, lon, unit } = req.body;

  if (!lat || !lon || !unit) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const dataWeather = await fetch(url.currentWeather(lat, lon, unit))
      .then((r) => r.json())
      .then(async (data) => {
        let d = await data;
        let json = {
          temperature: d.main.temp,
          localName: d.name,
          countryName: d.sys.country,
          codeIcon: d.weather[0].icon,
          date: new Date(d.dt * 1000),
          typeWeather: d.weather[0].main,
          humidity: d.main.humidity,
          pressure: d.main.pressure,
          visibility: d.visibility,
          feels_like: d.main.feels_like,
          sunrise: new Date(d.sys.sunrise * 1000),
          sunset: new Date(d.sys.sunset * 1000),
        };
        return json;
      })
      .catch((e) => `Error in request: ${e}`);

    const dataForecast = await fetch(url.forecast(lat, lon, unit))
      .then((r) => r.json())
      .then(async (dataPromise) => {
        let list = await dataPromise.list;
        list = getFormattedDate(list);
        return list;
      })
      .catch((e) => `Error in request: ${e}`);

    const dataAirPollution = await fetch(url.airPollution(lat, lon))
      .then((r) => r.json())
      .then(async (data) => {
        let d = await data.list[0].components;
        return (list = { pm2_5: d.pm2_5, so2: d.so2, no2: d.no2, o3: d.o3 });
      })
      .catch((e) => `Error in request: ${e}`);

    return res.status(200).json({
      weather: dataWeather,
      forecast: dataForecast,
      airPollution: dataAirPollution,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.error("Error in request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server Running in PORT ${port}`);
});
