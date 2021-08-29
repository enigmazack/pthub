import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory } from './model/site'

const ourbits = new NexusPHPSite({
  name: 'ourbits.club',
  url: 'https://ourbits.club/',
  abbreviation: 'OB',
  catagory: SiteCatagory.hd,
  tags: [
    SiteCatagory.movies,
    SiteCatagory.tv,
    SiteCatagory.animation
  ]
})

export default ourbits
