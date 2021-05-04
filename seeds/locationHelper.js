const coordArr = [
  { coordinates: [28.0305, -26.1929], location: 'Wits' },
  { coordinates: [28.056702, -26.107567], location: 'Sandton Mall' },
  { coordinates: [28.0412, -26.1465], location: 'Rosebank Mall' }]
// longitude latitude for locations with location name

module.exports.getGeoData = () => {
  const coordinatesData = coordArr[Math.floor(Math.random() * coordArr.length)]
  const location = coordinatesData.location
  const coordinates = coordinatesData.coordinates
  const geodata = {
    type: 'Point',
    coordinates
  }
  return { location, geodata }
}
