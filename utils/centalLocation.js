function findCentalLocation (coordArray) {
  let distanceSum = 0
  let minDistanceSum = Infinity
  let pointID = 0
  for (let i = 0; i < coordArray.length; i++) {
    distanceSum = 0
    for (let j = 0; j < coordArray.length; j++) {
      console.log(coordArray[i].coordinates[0] + ' ' + coordArray[j].coordinates[0] + ' ' + coordArray[i].coordinates[1] + ' ' + coordArray[j].coordinates[1] + ' \n')
      distanceSum += Math.sqrt(Math.pow(coordArray[i].coordinates[0] - coordArray[j].coordinates[0], 2) + Math.pow(coordArray[i].coordinates[1] - coordArray[j].coordinates[1], 2))
    }
    console.log(distanceSum)
    if (distanceSum <= minDistanceSum && distanceSum != 0) {
      minDistanceSum = distanceSum
      pointID = i
    }
  }
  console.log(coordArray[pointID].location + ' is the most central location.')
}