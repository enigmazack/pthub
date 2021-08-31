import NexusPHPSite from './model/nexusPHPSite'
import { ESiteCatagory } from './model/site'

class OB extends NexusPHPSite {}

const ourbits = new OB({
  name: 'ourbits.club',
  url: 'https://ourbits.club/',
  abbreviation: 'OB',
  catagory: ESiteCatagory.hd,
  tags: [
    ESiteCatagory.movies,
    ESiteCatagory.tv
  ]
})

export default ourbits
