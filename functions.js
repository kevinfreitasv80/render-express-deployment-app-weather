const url = {
  currentWeather(lat, lon, unit) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${process.env.KEYAPI}`;
  },
  forecast(lat, lon, unit) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${process.env.KEYAPI}`;
  },
  airPollution(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.KEYAPI}`;
  },
};

function getFormattedDate(arr) {
  let times = {
    0: "12AM",
    1: "1AM",
    2: "2AM",
    3: "3AM",
    4: "4AM",
    5: "5AM",
    6: "6AM",
    7: "7AM",
    8: "8AM",
    9: "9AM",
    10: "10AM",
    11: "11AM",
    12: "12PM",
    13: "1PM",
    14: "2PM",
    15: "3PM",
    16: "4PM",
    17: "5PM",
    18: "6PM",
    19: "7PM",
    20: "8PM",
    21: "9PM",
    22: "10PM",
    23: "11PM",
  };
  let listWeather = [];
  let listWind = [];

  for (const el of arr) {
    let date = new Date(el.dt * 1000);
    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    let month =
      date.getMonth() < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let time = times[date.getHours()];
    let icon = el.weather[0].icon;
    let temp = parseInt(el.main.temp);
    let speedWind = el.wind.speed;
    let degWind = el.wind.deg;

    let jsonWeather = {
      dt: date,
      date: `${month}/${day}`,
      time,
      icon,
      temp,
    };

    let jsonWind = {
      date: `${month}/${day}`,
      time,
      speedWind,
      degWind,
    };

    listWeather.push(jsonWeather);
    listWind.push(jsonWind);
  }

  return { listWeather, listWind };
}

const formatResult = (result) =>
  result.status === "fulfilled" ? result.value : { error: result.reason };

module.exports = { url, getFormattedDate, formatResult };
