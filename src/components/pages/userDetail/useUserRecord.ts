import { useCallback, useEffect, useRef, useState } from "react"
import { usersAPI } from "@/services/api"
import type { UserListResponse, UserRoleResponse } from "@/types"
import { isNotFound } from "@/utils/apiError"

// The route reuses the page across :userId, so a late response for the previous user is dropped.
export function useUserRecord(userId: string | undefined) {
  const currentId = useRef(userId)
  const [user, setUserState] = useState<UserListResponse | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userFailed, setUserFailed] = useState(false)
  const [roles, setRoles] = useState<UserRoleResponse[] | null>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [loadedFor, setLoadedFor] = useState(userId)

  if (loadedFor !== userId) {
    setLoadedFor(userId)
    setUserState(null)
    setUserLoading(true)
    setUserFailed(false)
    setRoles([])
    setRolesLoading(true)
  }

  useEffect(() => {
    currentId.current = userId
  }, [userId])

  const setUser = useCallback((data: UserListResponse) => {
    if (data.id === currentId.current) setUserState(data)
  }, [])

  const fetchUser = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await usersAPI.get(userId)
      setUser(data)
      if (userId === currentId.current) setUserFailed(false)
    } catch (err) {
      if (userId === currentId.current) setUserFailed(!isNotFound(err))
    } finally {
      if (userId === currentId.current) setUserLoading(false)
    }
  }, [userId, setUser])

  const fetchRoles = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await usersAPI.listRoles(userId)
      if (userId === currentId.current) setRoles(data)
    } catch {
      if (userId === currentId.current) setRoles(null)
    } finally {
      if (userId === currentId.current) setRolesLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
    fetchRoles()
  }, [fetchUser, fetchRoles])

  return { user, setUser, userLoading, userFailed, roles, rolesLoading, fetchUser, fetchRoles }
}
