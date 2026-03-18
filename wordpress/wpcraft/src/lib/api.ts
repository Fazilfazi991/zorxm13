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
      }
    }
  )
  return res.json()
}

export async function generatePage(
  postId: number,
  prompt: string,
  nonce: string,
  apiBase: string
) {
  const res = await fetch(
    `${apiBase}generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      },
      body: JSON.stringify({ prompt, postId })
    }
  )
  return res.json()
}
