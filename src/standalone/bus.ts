import mitt from 'mitt'

interface Events {
  search: undefined
}

const bus = mitt<Events>()

export default bus
