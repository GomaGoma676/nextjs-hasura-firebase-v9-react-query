import { useEffect } from 'react'
import { auth, db } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot, doc } from 'firebase/firestore'
import { useRouter } from 'next/router'
import Cookie from 'universal-cookie'

export let unSubMeta: () => void

export const useUserChanged = () => {
  const cookie = new Cookie()
  const router = useRouter()
  const HASURA_TOKEN_KEY = 'https://hasura.io/jwt/claims'
  useEffect(() => {
    const unSubUser = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(true)
        const idTokenResult = await user.getIdTokenResult()
        const hasuraClaims = idTokenResult.claims[HASURA_TOKEN_KEY]
        if (hasuraClaims) {
          cookie.set('token', token, { path: '/' })
          router.push('/tasks')
        } else {
          unSubMeta = onSnapshot(doc(db, 'user_meta', user.uid), async () => {
            const tokenSnap = await user.getIdToken(true)
            const idTokenResultSnap = await user.getIdTokenResult()
            const hasuraClaimsSnap = idTokenResultSnap.claims[HASURA_TOKEN_KEY]
            if (hasuraClaimsSnap) {
              cookie.set('token', tokenSnap, { path: '/' })
              router.push('/tasks')
            }
          })
        }
      }
    })
    return () => {
      unSubUser()
    }
  }, [])
  return {}
}
