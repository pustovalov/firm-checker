const ENV   = process.env
// const aws   = require('aws-sdk')
const telegramBot = require('node-telegram-bot-api')
// const ses   = new aws.SES({
//   region: ENV.AWSS_REGION
// })
const bot = new telegramBot(ENV.TELEGRAM_BOT_TOKEN)

module.exports = {
  sendEmail(data) {
    const text = `Month: ${ENV.TRACKING_MONTH} \n\n Dates: ${data.join()}`

    const eParams = {
      Destination: {
        ToAddresses: [ENV.EMAIL_RECIPIENT]
      },
      Message: {
        Body: {
          Text: {
            Data: text
          }
        },
        Subject: {
          Data: "New Booking Days at FIRM"
        }
      },
      Source: `${ENV.EMAIL_SENDER}`
    }

    const email = ses.sendEmail(eParams, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("===EMAIL SENT===")
      }
    })
  },

  sendTelegramMessage(data) {
    const text = `Month: ${ENV.TRACKING_MONTH}\n\nDates: ${data.join()}`

    bot.sendMessage(ENV.TELEGRAM_USER_ID, text)
  },

  sendTelegramCM(data) {
    const text = `Month: ${ENV.TRACKING_MONTH}\n\nDates: ${data.join()}`

    bot.sendMessage(ENV.TELEGRAM_CHANNEL_ID, data)
  }
}
