module.exports = {
  generateParams(params) {
    let esc = encodeURIComponent
    let query = Object.keys(params)
                  .map(k => `${esc(k)}=${esc(params[k])}`)
                  .join('&')
    return query
  }
}
