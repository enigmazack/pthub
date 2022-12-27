import type { State as UISettingsState } from '../uiSettings/state'
import type { State as ParamsState } from '../params/state'
import type { State as SiteSettingsState } from '../siteSettings/state'
import type { State as UserDataState } from '../userData/state'

export interface RootState {
  uiSettings: UISettingsState
  userData: UserDataState
  siteSettings: SiteSettingsState
  params: ParamsState
}
