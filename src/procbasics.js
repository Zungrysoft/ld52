export function generateFlat (params) {
  const width = params.width
  const length = params.length
  const height = params.height

  const terrain = {}

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < length; j++) {
      terrain[[i, j]] = height
    }
  }

  return terrain
}
