import * as sites from '@/sites'

export default class AppService {
  getSupportedSites (): string[] {
    return Object.keys(sites)
  }
}
