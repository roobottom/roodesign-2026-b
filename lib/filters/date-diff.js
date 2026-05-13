const moment = require('moment')

module.exports = (firstDate, secondDate, format = 'days') => {
  const a = moment(firstDate)
  const b = moment(secondDate)
  return a.diff(b, format)
}
