import dayjs from 'dayjs'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dayjs(date?: dayjs.ConfigType, format?: dayjs.OptionType, locale?: string, strict?: boolean): dayjs.Dayjs
 }
}
