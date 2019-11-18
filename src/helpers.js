// Convert each period to timeframe/range
const convertHoursToTime = (hour) => `${(parseInt(hour) < 10) ? '0'+hour : hour }:00:00`;

// create timeframes for each period
const getPeriodRange = (p) => {
      var min, max, period;
      period = p.toString()
      min = convertHoursToTime(p-1)
      max = convertHoursToTime(p)
      return {period, min, max}
}

// create all timeframes given number of periods
const createPeriodRanges = (nPeriods) => {
    var periods = {};
    for (var x = 1; x <= nPeriods; x++) {
      periods[x] = getPeriodRange(x)
    }
    return periods
}

// check if timestamp belongs to given period
const hasClickPeriod = (timestamp, min, max) => {
    const moment = require("moment")
    var time = timestamp.slice(-8)
    var date = timestamp

    timestamp = moment(date+"T"+time, "MM-DD-YYYYTHH:mm:ss")
    min = moment(date+"T"+min, "MM-DD-YYYYTHH:mm:ss")
    max = moment(date+"T"+max, "MM-DD-YYYYTHH:mm:ss")


    if (timestamp >= min && timestamp < max){
        return true
    }

    return false
}


// Sort and find most expensive click with IP occurence <= 10
const checkClicks = (data, period) => {
    var period_clicks = []
    var highest_click = []
    var invalid_ips = {}

    // use ip_count as lookup to counter IP appearance
    var ip_count = {}

    data.forEach(item => {
        var { ip, timestamp } = item
        if (ip_count[ip]){
            ip_count[ip] += 1
            if (ip_count[ip] > 10){
                invalid_ips[ip] = ip_count[ip]
            }
        } else{
            ip_count[ip] = 1
        }
        var {max, min} = period

        if (hasClickPeriod(timestamp, min, max)){
            period_clicks.push(item)
        }

      period_clicks = period_clicks.sort((a, b) => a.timestamp - b.timestamp)

    })


    if (period_clicks.length > 1){
        var max_amt = 0
        var expensive_ips = []
        for (var click in period_clicks){
            var c = period_clicks[click]
            if (c.amount > max_amt && ip_count[c.ip] <= 10){
                max_amt = c.amount
                highest_click = [c]
                expensive_ips.push(c.ip)
            } else if (c.amount === max_amt && ip_count[c.ip] <= 10 && !expensive_ips.includes(c.ip)){
                highest_click.push(c)
            }
        }

    } else if (period_clicks.length === 1 && ip_count[period_clicks[0].ip] <= 10) {
        highest_click = period_clicks
    }

    return { period_clicks, highest_click, invalid_ips }
}



module.exports = { convertHoursToTime, getPeriodRange, createPeriodRanges, checkClicks, hasClickPeriod }
