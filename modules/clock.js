var clockEl = document.getElementsByClassName('clock')[0];

for (var i = 1; i < 60; i++) {
  var line = document.createElement("div");
  line.className = "diallines";
  line.style.transform = "rotate(" + 6 * i + "deg)";
  clockEl.appendChild(line);
}

function clock() {
  var weekday = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      d = new Date(),
      h = d.getHours(),
      m = d.getMinutes(),
      s = d.getSeconds(),
      date = d.getDate(),
      month = d.getMonth() + 1,
      year = d.getFullYear();

  var hDeg = h * 30 + m * (360 / 720),
      mDeg = m * 6 + s * (360 / 3600),
      sDeg = s * 6;

  var hEl = document.querySelector('.hour-hand'),
      mEl = document.querySelector('.minute-hand'),
      sEl = document.querySelector('.second-hand'),
      dateEl = document.querySelector('.date'),
      dayEl = document.querySelector('.day');

  var day = weekday[d.getDay()];

  if (month < 10) {
    month = "0" + month;
  }

  hEl.style.transform = "rotate(" + hDeg + "deg)";
  mEl.style.transform = "rotate(" + mDeg + "deg)";
  sEl.style.transform = "rotate(" + sDeg + "deg)";
  dateEl.innerHTML = date + "/" + month + "/" + year;
  dayEl.innerHTML = day;
}

// Run immediately
clock();

// Update every second
setInterval(clock, 1000);
