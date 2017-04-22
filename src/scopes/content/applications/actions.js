// @flow

import apiClient from '../../../utils/apiClient'

import { APPLICATIONS } from '../../../constants/apiEndpoints'
import { RECEIVE_TTN_APPLICATION, RECEIVE_TTN_APPLICATIONS } from './types'
import type {
  AccessKey,
  AccessKeyOptions,
  Collaborator,
  Device,
  TTNApplication,
} from './types'
import type { Dispatch, GetState } from '../../../types/redux'

/**
 * Fetch ALL Applications
 */

export function getApplicationsAsync() {
  return async (dispatch: Dispatch, getState: GetState) => {
    const payload: Array<TTNApplication> = await apiClient.get(APPLICATIONS)
    return dispatch({ type: RECEIVE_TTN_APPLICATIONS, payload })
  }
}

/**
 * Fetch Application by ID
 */

export function getApplicationAsync(application: TTNApplication) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    const payload: TTNApplication = await apiClient.get(APPLICATIONS + id)
    return dispatch({ type: RECEIVE_TTN_APPLICATION, payload })
  }
}

/**
 * Add Application
 */

export function addApplicationAsync(application: TTNApplication) {
  const { handler, id, name } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.post(APPLICATIONS, { body: { id, name } })
      if (handler) await dispatch(updateHandlerAsync(application))
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## addApplicationAsync error', err)
    }
  }
}

/**
 * Update Existing Application
 */

export function updateApplicationAsync(application: TTNApplication) {
  const { handler, id, name } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.patch(APPLICATIONS + id, { body: { description: name } })
      if (handler) await dispatch(updateHandlerAsync(application))
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## updateApplicationAsync error', err)
    }
  }
}

/**
 * Fetch Devices for Application
 */

export function getApplicationDevicesAsync(application: TTNApplication) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    if (!application.handler) {
      console.warn(
        'Attempting to get devices with no handler registered, returning empty array'
      )
      return []
    }
    try {
      const payload: Array<TTNApplication> = await apiClient.get(
        APPLICATIONS + id + '/devices/'
      )
      return payload
    } catch (err) {
      console.log('## getApplicationDevicesAsync error', err)
    }
  }
}

/**
 * Fetch Single Device
 */

export function getDeviceAsync(application: TTNApplication, deviceId: string) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      const payload = await apiClient.get(
        APPLICATIONS + id + '/devices/' + deviceId
      )
      return payload
    } catch (err) {
      console.log('## getDeviceAsync error', err)
    }
  }
}

/**
  * Add Device
  */

export function addDeviceAsync(application: TTNApplication, device: Device) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.post(APPLICATIONS + id + '/devices', { body: device })
    } catch (err) {
      console.log('## addDeviceAsync error', err)
    }
  }
}

/**
 * Update Device
 */

export function updateDeviceAsync(
  application: TTNApplication,
  deviceId: string,
  device: Device
) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      const payload = await apiClient.patch(
        APPLICATIONS + id + '/devices/' + deviceId,
        { body: device }
      )
      return payload
    } catch (err) {
      console.log('## updateDeviceAsync error', err)
    }
  }
}

/**
 * Delete Device
 */

export function deleteDeviceAsync(application: TTNApplication, device: Device) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.delete(
        APPLICATIONS + id + '/devices/' + (device.dev_id || '')
      )
    } catch (err) {
      console.log('## deleteDeviceAsync error', err)
    }
  }
}

export function updateHandlerAsync(application: TTNApplication) {
  const { handler, id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      if (handler === 'none')
        await apiClient.delete(APPLICATIONS + id + '/registration')
      else
        await apiClient.put(APPLICATIONS + id + '/registration', {
          body: { handler },
        })
    } catch (err) {
      console.log('## updateHandlerAsync error', err)
    }
  }
}

/**
 * Delete Application
 */

export function deleteApplicationAsync(application: TTNApplication) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.delete(APPLICATIONS + id)
      await dispatch(getApplicationsAsync())
    } catch (err) {
      console.log('## deleteApplicationAsync error', err)
    }
  }
}

export function createEUIAsync(application: TTNApplication) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      const payload = await apiClient.post(APPLICATIONS + id + '/euis')
      await dispatch(getApplicationAsync(application))
      return payload
    } catch (err) {
      console.log('## createEUIAsync error', err)
    }
  }
}

export function deleteEUIAsync(application: TTNApplication, eui: string) {
  const { id } = application
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.delete(APPLICATIONS + id + '/euis/' + eui)
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## deleteEUIAsync error', err)
    }
  }
}

export function createAccessKeyAsync(
  application: TTNApplication,
  accessKeyOptions: AccessKeyOptions
) {
  const { id } = application
  const { name, rights } = accessKeyOptions
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.put(APPLICATIONS + id + '/access-keys/' + name, {
        body: { rights },
      })
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## createAccessKeyAsync error', err)
    }
  }
}

export function deleteAccessKeyAsync(
  application: TTNApplication,
  accessKey: AccessKey
) {
  const { id } = application
  const { name } = accessKey
  return async (dispatch: Dispatch, getState: GetState) => {
    console.log('deleting access key', name)
    try {
      await apiClient.delete(APPLICATIONS + id + '/access-keys/' + name)
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## deleteAccessKeyAsync error', err)
    }
  }
}

export function createCollaboratorAsync(
  application: TTNApplication,
  collaborator: Collaborator
) {
  const { id } = application
  const { username, rights } = collaborator
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.put(APPLICATIONS + id + '/collaborators/' + username, {
        body: { rights },
      })
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## createCollaboratorAsync error', err)
      throw err
    }
  }
}

export function deleteCollaboratorAsync(
  application: TTNApplication,
  collaborator: Collaborator
) {
  const { id } = application
  const { username } = collaborator
  return async (dispatch: Dispatch, getState: GetState) => {
    try {
      await apiClient.delete(APPLICATIONS + id + '/collaborators/' + username)
      await dispatch(getApplicationAsync(application))
    } catch (err) {
      console.log('## deleteCollaboratorAsync error', err)
    }
  }
}
