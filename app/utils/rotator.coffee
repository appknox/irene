mapping =
  0:
    0: 0
    90: -90
    180: -180
    270: 90

  90:
    0: 90
    90: 0
    180: -90
    270: 180

  180:
    0: 180
    90: 90
    180: 0
    270: -90

  270:
    0: -90
    90: -180
    180: 90
    270: 0

rotator = (oldRotation, newRotation) ->
  r1d = 0
  if oldRotation < 0
    r1d = 360
  r1 = r1d + oldRotation % 360
  r2d = 0
  if newRotation < 0
    r2d = 360
  r2 = r2d + newRotation % 360
  mapping[r1][r2]

`export default rotator`
