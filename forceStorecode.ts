import { storeCodeFromRoute } from '@vue-storefront/core/lib/multistore'
import store from '@vue-storefront/core/store'
import { isServer } from '@vue-storefront/core/helpers'
import Vue from 'vue'

export const forceStorecode = async (context, { url }) => {
  if (isServer) {
    const { storeViews } = store.state.config
    const storeCode = storeCodeFromRoute(url)
    if (storeViews.multistore && storeViews.forcePrefix && !storeCode) {
      const createUrl = _storeCode => `/${_storeCode}/${url}`
      const { request: req, response: res } = Vue.prototype.$ssrRequestContext.server
      const cfCountry = req.headers.http_cf_ipcountry
      if (cfCountry && storeViews[cfCountry]) {
        console.log(url, cfCountry)
        const newUrl = createUrl(cfCountry)
        return res.redirect(newUrl)
      }
      if (storeViews.fallbackStoreCode) {
        const newUrl = createUrl(storeViews.fallbackStoreCode)
        return res.redirect(newUrl)
      }
      // TODO: Maybe do geoip here as well?
      const lastResort: any = Object.values(storeViews).find((view: any) => view && view.storeCode)
      const newUrl = createUrl(lastResort.storeCode)
      return res.redirect(newUrl)
    }
  }
}
