const fetch = require('node-fetch')

const params = {
  query: '20 Sunnyside Road, Orchards, Johannesburg'
}

async function getGeocode (location) {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(location)}$.json?access_token=pk.eyJ1Ijoiam9zaHVhdG9iaWFzIiwiYSI6ImNrbnRkM3ByZTAxdHgycHBzM3FkcGswZmMifQ.JyQyybatt9P0tqxlS7xU3w`
  const response = await fetch(apiUrl)
  const data = await response.json()
  const coordinates = [data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]]
  console.log([data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]])
  return coordinates
}

getGeocode('20 Sunnyside Road, Orchards, Johannesburg')

/* async function getGeocode1 (location) {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(location)}$.json?access_token=pk.eyJ1Ijoiam9zaHVhdG9iaWFzIiwiYSI6ImNrbnRkM3ByZTAxdHgycHBzM3FkcGswZmMifQ.JyQyybatt9P0tqxlS7xU3w`
  const response = await fetch(apiUrl)
  const data = await response.json()
  const coordinates = [data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]]
  return coordinates
} */

/* const coordinates = getGeocode1('20 Sunnyside Road, Orchards, Johannesburg')
console.log(coordinates) */
