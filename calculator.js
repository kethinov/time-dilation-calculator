// the time dilation calculator, for the form in index.html, whose id is time_dilation_calculator
//
// it is its own file, and finds its form by id rather than taking the first one on the page, so that another page can use it too: copy the form out of index.html into the page and load this after it
;(() => {
  const form = document.getElementById('time_dilation_calculator')
  if (!form) return
  const profileSelect = form.querySelector('#mission_profile')

  const C = 299792458 // speed of light in meters per second
  const G = 9.80665 // standard gravity in meters per second squared
  const KM_PER_AU = 149597870.7
  const KM_PER_LY = 9460730472580.8

  // days per unit, matching the labels in the unit dropdown
  const daysPerUnit = {
    Hours: 1 / 24,
    Days: 1,
    Months: 30,
    Years: 365
  }

  // each field row is a div wrapping a dt/dd pair, so hiding the div hides the whole row
  function toggleFields() {
    const isVelocity = profileSelect.value === 'velocity'
    form.querySelectorAll('.velocityField').forEach((el) => el.classList.toggle('hiddenField', !isVelocity))
    form.querySelectorAll('.accelField').forEach((el) => el.classList.toggle('hiddenField', isVelocity))
  }

  function fmt(n) {
    if (!isFinite(n)) return 'too large to display'
    return n.toLocaleString('en-US')
  }

  profileSelect.addEventListener('change', toggleFields)
  toggleFields()

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    const profile = profileSelect.value
    const shipTime = parseFloat(form.querySelector('#spaceship_time').value)
    const timeUnit = form.querySelector('#spaceship_time_unit').value
    const shipDays = shipTime * daysPerUnit[timeUnit]
    const shipSeconds = shipDays * 86400
    const output = form.querySelector('output')

    if (!isFinite(shipTime) || shipTime <= 0) {
      output.innerHTML = '<p><strong>Enter a travel time greater than zero.</strong></p>'
      return
    }

    if (profile === 'velocity') {
      const beta = parseFloat(form.querySelector('#spaceship_speed').value) / 100
      if (!isFinite(beta) || beta < 0 || beta >= 1) {
        output.innerHTML = '<p><strong>Enter a speed of at least 0% and less than 100% of light speed.</strong></p>'
        return
      }
      const gamma = 1 / Math.sqrt(1 - Math.pow(beta, 2))
      const kmPerSecond = (C * beta) / 1000
      const kmPerDay = kmPerSecond * 86400
      const auPerDay = kmPerDay / KM_PER_AU // km per day / number of km in an au
      output.innerHTML = `
        <p><strong>${timeUnit} elapsed on Earth: ${fmt(shipTime * gamma)}</strong></p>
        <p>Time dilation factor (gamma): ${fmt(gamma)}</p>
        <p>Spacecraft speed:</p>
        <ul>
          <li>${fmt(kmPerSecond)} km/second</li>
          <li>${fmt(kmPerSecond * 3600)} km/hour</li>
          <li>${fmt(kmPerDay)} km/day</li>
          <li>${fmt(auPerDay)} AU/day (astronomical units per day)</li>
        </ul>
        <p>Distance traveled, measured from Earth: ${fmt(shipDays * gamma * auPerDay)} AU (${fmt(shipDays * gamma * auPerDay * KM_PER_AU / KM_PER_LY)} light years)</p>
        <p>Distance traveled, measured aboard the spacecraft (length contracted): ${fmt(shipDays * auPerDay)} AU</p>`
      return
    }

    // relativistic rocket: constant proper acceleration a felt aboard the ship. Over proper time tau, the Earth frame sees:
    //
    //   t = (c / a) * sinh(a * tau / c)
    //   d = (c^2 / a) * (cosh(a * tau / c) - 1)
    //   v / c = tanh(a * tau / c)
    //
    // a flip and burn is two mirrored halves of that burn, so run half the proper time and double the resulting time and distance
    const gees = parseFloat(form.querySelector('#spaceship_accel').value)
    if (!isFinite(gees) || gees <= 0) {
      output.innerHTML = '<p><strong>Enter an acceleration greater than zero.</strong></p>'
      return
    }
    const a = gees * G
    const legs = profile === 'flip' ? 2 : 1
    const legSeconds = shipSeconds / legs
    const x = (a * legSeconds) / C // dimensionless rapidity of one leg
    const gamma = Math.cosh(x)
    const beta = Math.tanh(x)
    const earthSeconds = legs * (C / a) * Math.sinh(x)
    const distanceKm = (legs * ((C * C) / a) * (Math.cosh(x) - 1)) / 1000
    const earthUnits = earthSeconds / 86400 / daysPerUnit[timeUnit]
    const peak = profile === 'flip' ? 'at turnaround' : 'at journey’s end'
    output.innerHTML = `
      <p><strong>${timeUnit} elapsed on Earth: ${fmt(earthUnits)}</strong></p>
      <p>Time dilation factor (gamma) ${peak}: ${fmt(gamma)}</p>
      <p>Top speed ${peak}: ${fmt(beta * 100)}% of light speed (${fmt((C * beta) / 1000)} km/second)</p>
      <p>Distance traveled, measured from Earth: ${fmt(distanceKm / KM_PER_AU)} AU (${fmt(distanceKm / KM_PER_LY)} light years)</p>
      ${profile === 'flip' ? '<p>The spacecraft arrives at rest relative to its starting frame.</p>' : '<p>The spacecraft is still under thrust on arrival and does not slow down.</p>'}`
  })
})()
