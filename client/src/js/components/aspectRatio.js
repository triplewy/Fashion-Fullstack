export function setAspectRatio(width, height) {
  var aspectRatio = width/height
  if (aspectRatio >= 0.75 && width > 660) {
    aspectRatio = width/660
    return [660, height/aspectRatio]
  } else if (aspectRatio < 0.75 && height > 880) {
    aspectRatio = height/880
    return [width/aspectRatio, 880]
  } else {
    return [width, height]
  }
}

export function setAspectRatioImageList(width, height) {
  var aspectRatio = width/height
  if (aspectRatio >= 0.75 && width > 150) {
    aspectRatio = width/150
    return [150, height/aspectRatio]
  } else if (aspectRatio < 0.75 && height > 200) {
    aspectRatio = height/200
    return [width/aspectRatio, 200]
  } else {
    return [width, height]
  }
}

export function setAspectRatioImageTetrisBlock(width, height) {
  var aspectRatio = width/height
  if (width > 384) {
    aspectRatio = width/384
    return [384, height/aspectRatio]
  }
  // if (aspectRatio >= 0.75 && width > 384) {
  //   aspectRatio = width/384
  //   return [384, height/aspectRatio]
  // }
  // else if (aspectRatio < 0.75 && height > 512) {
  //   console.log("yopooooooooo");
  //   aspectRatio = height/512
  //   return [width/aspectRatio, 512]
  // }
  else {
    return [width, height]
  }
}
