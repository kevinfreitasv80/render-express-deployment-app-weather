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
    const [dataWeather, dataForecast, dataAirPollution] = await Promise.all([
      fetch(url.currentWeather(lat, lon, unit))
        .then((r) => r.json())
        .then((data) => ({
          temperature: data.main.temp,
          localName: data.name,
          countryName: data.sys.country,
          codeIcon: data.weather[0].icon,
          date: new Date(data.dt * 1000),
          typeWeather: data.weather[0].main,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          visibility: data.visibility,
          feels_like: data.main.feels_like,
          sunrise: new Date(data.sys.sunrise * 1000),
          sunset: new Date(data.sys.sunset * 1000),
        })),

      fetch(url.forecast(lat, lon, unit))
        .then((r) => r.json())
        .then((data) => getFormattedDate(data.list)),

      fetch(url.airPollution(lat, lon))
        .then((r) => r.json())
        .then((data) => ({
          pm2_5: data.list[0].components.pm2_5,
          so2: data.list[0].components.so2,
          no2: data.list[0].components.no2,
          o3: data.list[0].components.o3,
        })),
    ]);

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
