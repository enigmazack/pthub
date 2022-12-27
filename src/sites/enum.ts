export enum ESiteStatus {
  empty = 'empty',
  login = 'login',
  logout = 'logout',
  timeout = 'timeout',
  connecting = 'connecting',
  unknow = 'unknow',
  error = 'error',
  succeed = 'succeed',
  getUserDataFailed = 'getUserDataFailed',
  getUserIdFailed = 'getUserIdFailed',
  searchFailed = 'searchFailed',
  getTorrentFailed = 'getTorrentFailed',
}

export enum ETorrentCatagory {
  movies = 'movies',
  animation = 'animation',
  documentary = 'documentary',
  tv = 'tv',
  music = 'music',
  mv = 'mv',
  ebook = 'ebook',
  learning = 'learning',
  sports = 'sports',
  application = 'application',
  games = 'games',
  other = 'other',
  undefined = 'undefined',
  xxx = 'xxx',
}

export enum ETorrentPromotion {
  free = 'Free',
  double = '2x',
  doubleFree = '2xFree',
  half = '50%',
  doubleHalf = '2x50%',
  thirtyPercent = '30%',
  quarter = '25%',
  threeQuarters = '75%',
}
