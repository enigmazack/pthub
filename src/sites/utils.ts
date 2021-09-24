/**
  * parse size string into bytes
  * @param sizeString
  * @returns
  */
export function parseSize (sizeString: string): number {
  const sizeMatch = sizeString.match(/^(\d+\.?\d*).*?([ZEPTGMK]?i?B$)/i)
  if (sizeMatch) {
    const sizeNumber = parseFloat(sizeMatch[1])
    const sizeUnit = sizeMatch[2]
    switch (true) {
      case /Zi?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 70)
      case /Ei?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 60)
      case /Pi?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 50)
      case /Ti?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 40)
      case /Gi?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 30)
      case /Mi?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 20)
      case /Ki?B/i.test(sizeUnit):
        return sizeNumber * Math.pow(2, 10)
      default:
        return sizeNumber
    }
  }
  return 0
}
