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
  searchFailed = 'searchFailed'
}

export enum ETorrentCatagory {
  movies = 'movies',
  animation = 'animation',
  documentary = 'documentary',
  tv = 'tv',
  tvEpisode = 'tv.episode',
  tvSeason = 'tv.season',
  tvShow = 'tv.show',
  music = 'music',
  mv = 'mv',
  ebook = 'ebook',
  sports = 'sports',
  opera = 'opera',
  audio = 'audio',
  application = 'application',
  games = 'games',
  other = 'other'
}

export enum ETorrentPromotion {
  free = 'Free',
  double = '2x',
  doubleFree = '2xFree',
  half = '50%',
  doubleHalf = '2x50%',
  thirtyPercent = '30%'
}
