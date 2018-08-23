const _MS_PER_MINUTE = 1000 * 60;

export function dateDiffInDays(date) {
    var uploadDate = Math.floor((Date.now() - date) / _MS_PER_MINUTE)
    if (uploadDate > 1439) {
      uploadDate = Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60 * 24)) + " days"
    } else if (uploadDate > 59) {
      uploadDate = Math.floor((Date.now() - date) / (_MS_PER_MINUTE * 60)) + " hours"
    } else {
      uploadDate = uploadDate + " minutes"
    }
    return uploadDate
}
