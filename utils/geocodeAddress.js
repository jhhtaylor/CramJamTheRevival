const fetch = require('node-fetch')

module.exports.getGeocode = async (location) => {
  const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURI(location)}$.json?access_token=pk.eyJ1Ijoiam9zaHVhdG9iaWFzIiwiYSI6ImNrbnRkM3ByZTAxdHgycHBzM3FkcGswZmMifQ.JyQyybatt9P0tqxlS7xU3w`
  const response = await fetch(apiUrl)
  const data = await response.json()
  let coords = null
  if (data.features.length > 0) {
    coords = [data.features[0].geometry.coordinates[0], data.features[0].geometry.coordinates[1]]
  }
  return coords
}
