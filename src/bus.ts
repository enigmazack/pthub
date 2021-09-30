import mitt from 'mitt'

type Events = {
  search: undefined
}

const bus = mitt<Events>()

export default bus
