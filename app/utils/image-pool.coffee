class ImagePool
  images: []
  counter: 0

  constructor: (@size) ->

  next: ->
    if @images.length < @size
      image = new Image
      @images.push image
      image
    else if @counter >= @size
      # Reset for unlikely but theoretically possible overflow.
      @counter = 0
      @images[@counter++ % @size]

`export default ImagePool`
