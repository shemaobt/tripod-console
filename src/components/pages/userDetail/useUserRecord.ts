import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { usersAPI } from "@/services/api"
import type { UserListResponse, UserRoleResponse } from "@/types"

// A rota reaproveita a página ao trocar de :userId, então tudo que chega do
// servidor passa por aqui e só é aplicado se ainda for do usuário da URL:
// resposta atrasada do usuário anterior (leitura ou escrita) é descartada, e
// a troca zera usuário e papéis para a tela não agir sobre o registro velho.
export function useUserRecord(userId: string | undefined) {
  const currentId = useRef(userId)
  const [user, setUserState] = useState<UserListResponse | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [roles, setRoles] = useState<UserRoleResponse[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [loadedFor, setLoadedFor] = useState(userId)

  if (loadedFor !== userId) {
    setLoadedFor(userId)
    setUserState(null)
    setUserLoading(true)
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
    } catch {
      if (userId === currentId.current) toast.error("Failed to load user")
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
      if (userId === currentId.current) toast.error("Failed to load roles")
    } finally {
      if (userId === currentId.current) setRolesLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
    fetchRoles()
  }, [fetchUser, fetchRoles])

  return { user, setUser, userLoading, roles, rolesLoading, fetchUser, fetchRoles }
}
