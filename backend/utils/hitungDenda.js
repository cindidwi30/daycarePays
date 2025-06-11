//utils/hitungDenda.js

const moment = require("moment");

function parseTimeToDate(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );
}

function hitungDenda(paket, pulangAt) {
  const endTime = parseTimeToDate(paket.endTime);
  const grace = paket.gracePeriod || 0;
  const deadline = new Date(endTime.getTime() + grace * 60000);

  const keterlambatan = (pulangAt - deadline) / 60000; // dalam menit

  if (keterlambatan <= 0) return { lateMinutes: 0, fee: 0 };

  if (paket.lateFeeType === "statis") {
    const jamTerlambat = Math.ceil(keterlambatan / 60);
    const fee = Math.min(
      jamTerlambat * paket.lateFeePerHour,
      paket.maxLateFeePerDay || Infinity
    );
    return { lateMinutes: keterlambatan, fee };
  } else if (paket.lateFeeType === "dinamis") {
    let fee = 0;
    for (let rule of paket.lateFeeRules) {
      if (keterlambatan >= rule.minutes) {
        fee = rule.fee;
      }
    }
    return { lateMinutes: keterlambatan, fee };
  }

  return { lateMinutes: keterlambatan, fee: 0 };
}

module.exports = { hitungDenda };
