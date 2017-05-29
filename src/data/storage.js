import * as constant from '@/domain/constant'

export const setToken = (storage, token) => {
  storage.setItem(constant.KEY_TOKEN, token)
}

export const getToken = (storage) => {
  return storage.getItem(constant.KEY_TOKEN)
}
