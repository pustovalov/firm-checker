const ENV   = process.env
const aws   = require('aws-sdk')
const ses   = new aws.SES({
  region: ENV.AWSS_REGION
})

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
  }
}
