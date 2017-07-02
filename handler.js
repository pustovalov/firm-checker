const _     = require('lodash')
const pg    = require('pg')
const fetch = require('node-fetch')
const async = require('asyncawait/async')
const await = require('asyncawait/await')

const helpers = require('./lib/helpers')
const notification = require('./lib/notification')

const generateParams = helpers.generateParams
const sendTelegramMessage = notification.sendTelegramMessage
const ENV = process.env

const clientConfig = `pg://${ENV.DB_USER}:${ENV.DB_PASSWORD}@${ENV.DB_URL}/${ENV.DB_NAME}`
const client = new pg.Client(clientConfig)

const getLastRecord = async(() => {
  const query = client.query("SELECT * FROM schedules ORDER BY id DESC limit 1")

  let response = await(
    query.on("end", result => {})
  )

  return response.rows[0].booking_days
})

const makeRequest = async(() => {
  let options = {
    "service_ids[]": ENV.SERVICE_ID,
    "staff_id": ENV.BARBER_ID,
    "date": `${ENV.TRACKING_YEAR}-${ENV.TRACKING_MONTH}-${ENV.TRACKING_DAY}`
  }
  let params = generateParams(options)

  let response = await(
    fetch(`${ENV.REQUEST_URL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${ENV.JWT_TOKEN}`
      }
    })
  )

  let data = await(response.json())

  return data.booking_days;
})

const processData = (saved_days, current_days) => {
  let notificationData = ""
  let saved_days_tracking_month = saved_days[ENV.TRACKING_MONTH]
  let current_days_tracking_month = current_days[ENV.TRACKING_MONTH]
  let needSave = false

  if (!saved_days_tracking_month && current_days_tracking_month) {
    needSave = true
    notificationData = current_days_tracking_month

  } else if (saved_days_tracking_month && current_days_tracking_month) {
    let newBookinDays = _.difference(current_days_tracking_month, saved_days_tracking_month)

    if (!_.isEmpty(newBookinDays)) {
      notificationData = newBookinDays
      needSave = true
    }
  }

  if (notificationData) {
    sendTelegramMessage(notificationData)
  }

  if (needSave) {
    saveRecord(current_days)
  } else {
    client.end()
  }
}

const saveRecord = (data) => {
  client.query('INSERT INTO schedules(barber_id, booking_days) values($1, $2)', [ENV.BARBER_ID, JSON.stringify(data)], () => {
    client.end()
  })
}

const program = async(() => {
  client.connect()
  const currentBookingDays = await(makeRequest())
  const savedBookingDays = await(getLastRecord())

  processData(savedBookingDays, currentBookingDays)
})


module.exports.run = (event, context, callback) => {
  program()
}
