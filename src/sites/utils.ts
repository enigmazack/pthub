/**
  * parse size string into bytes
  * @param sizeString
  * @returns
  */
export function parseSize(sizeString: string): number {
  const sizeMatch = sizeString.match(/^(\d+\.?\d*).*?([ZEPTGMK]?i?B$)/i)
  if (sizeMatch) {
    const sizeNumber = parseFloat(sizeMatch[1])
    const sizeUnit = sizeMatch[2]
    switch (true) {
      case /Zi?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 70
      case /Ei?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 60
      case /Pi?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 50
      case /Ti?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 40
      case /Gi?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 30
      case /Mi?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 20
      case /Ki?B/i.test(sizeUnit):
        return sizeNumber * 2 ** 10
      default:
        return sizeNumber
    }
  }
  return 0
}

/**
 * parse time ago string
 * @param timeStr
 * @returns
 */
export function parseTimeAgo(timeStr: string): number {
  const timeRegex = timeStr.match(
    /((\d+).+?(minute|hour|day|week|month|year)s?.*?(,|and))?.*?(\d+).+?(minute|hour|day|week|month|year)s?/,
  )
  let milliseconds = 0
  if (timeRegex) {
    if (timeRegex[1] === undefined) {
      milliseconds = getMilliseconds(parseInt(timeRegex[5]), timeRegex[6])
    }
    else {
      milliseconds = getMilliseconds(parseInt(timeRegex[2]), timeRegex[3])
        + getMilliseconds(parseInt(timeRegex[5]), timeRegex[6])
    }
  }
  const timeStamp = Date.now() - milliseconds
  return timeStamp
}

function getMilliseconds(num: number, unit: string): number {
  let milliseconds = 0
  milliseconds = num * 60 * 1000
  if (unit === 'minute')
    return milliseconds
  milliseconds = milliseconds * 60
  if (unit === 'hour')
    return milliseconds
  milliseconds = milliseconds * 24
  if (unit === 'day')
    return milliseconds
  milliseconds = milliseconds * 7
  if (unit === 'week')
    return milliseconds
  milliseconds = milliseconds * 30 / 7
  if (unit === 'month')
    return milliseconds
  milliseconds = milliseconds * 12
  return milliseconds
}

/**
 * unescape HTML string
 * @param str
 * @returns
 */
export function unescapeHTML(str: string): string {
  const temp = document.createElement('div')
  temp.innerHTML = str
  return temp.innerText
}

/**
 * decode data-cfemail
 * @param encodedString
 * @returns
 */
export function cfDecodeEmail(encodedString: string): string {
  let email = ''
  const r = parseInt(encodedString.slice(0, 2), 16)
  let n
  let i
  for (n = 2; encodedString.length - n; n += 2) {
    i = parseInt(encodedString.slice(n, 2 + n), 16) ^ r
    email += String.fromCharCode(i)
  }
  return email
}
