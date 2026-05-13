module.exports = (daysRemaining, format = 'years') => {
  let years = 0
  let months = 0
  let weeks = 0
  let days = 0
  let remaining = daysRemaining

  while (remaining) {
    if (remaining >= 365) {
      years += 1
      remaining -= 365
    } else if (remaining >= 30) {
      months += 1
      remaining -= 30
    } else if (remaining >= 7) {
      weeks += 1
      remaining -= 7
    } else {
      days += 1
      remaining -= 1
    }
  }

  return {
    days,
    weeks,
    months,
    years
  }[format]
}
