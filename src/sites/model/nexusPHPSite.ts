import Site from './site'

export default class NexusPHPSite extends Site {
  async checkConnection (): Promise<string> {
    try {
      let isLogin = false
      const r = await this.get('.')
      if (r.request && r.request.responseURL) {
        isLogin = !r.request.responseURL.match(/login.php/)
      }
      return isLogin ? 'connected_with_login' : 'connected_without_login'
    } catch {
      return 'no_connection'
    }
  }
}
