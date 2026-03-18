import { PageData } from '../types/schema'

export async function savePage(
  postId: number,
  data: PageData,
  nonce: string,
  apiBase: string
) {
  const res = await fetch(
    `${apiBase}page/${postId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      credentials: 'include',
      body: JSON.stringify({ data })
    }
  )
  return res.json()
}

export async function publishPage(
  postId: number,
  nonce: string,
  apiBase: string
) {
  const res = await fetch(
    `${apiBase}publish/${postId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      credentials: 'include'
    }
  )
  return res.json()
}

export async function generatePage(
  postId: number,
  prompt: string,
  nonce: string,
  apiBase: string,
  generationType: 'page' | 'section' = 'page'
) {
  const res = await fetch(
    `${apiBase}generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      credentials: 'include',
      body: JSON.stringify({ 
        prompt,
        post_id: postId,
        generation_type: generationType
      })
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(
      () => ({ message: 'Request failed' })
    )
    throw new Error(
      err.message || 
      err.data?.message ||
      `HTTP ${res.status}`
    )
  }
  return res.json()
}
