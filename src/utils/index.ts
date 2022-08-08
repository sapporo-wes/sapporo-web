import dayjs from 'dayjs'
import yaml from 'js-yaml'

export const parseJsonOrYaml = (
  content: string
): ReturnType<typeof JSON.parse> | ReturnType<typeof yaml.load> | false => {
  try {
    return JSON.parse(content)
  } catch (_) {
    try {
      return yaml.load(content)
    } catch (_) {
      // do nothing
    }
  }

  return false
}

export const validUrl = (val: string): boolean => {
  let url
  try {
    url = new URL(val)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsText(file)
  })
}

export const convertGitHubUrl = async (url: string | URL): Promise<string> => {
  const urlObj = new URL(url.toString())
  if (urlObj.host === 'github.com') {
    const repoName = urlObj.pathname.split('/').slice(1, 3).join('/')
    const filePath = urlObj.pathname.split('/').slice(5).join('/')
    urlObj.host = 'api.github.com'
    urlObj.pathname = `repos/${repoName}/contents/${filePath}`
    const apiUrl = urlObj.toString()
    const res = await fetch(apiUrl, { method: 'GET' }).catch(() => {
      return url.toString()
    })
    if (typeof res === 'string') {
      return url.toString()
    } else if (res.ok) {
      const content = await res.json()
      return content.download_url
    } else {
      return url.toString()
    }
  }
  return url.toString()
}

export const isJson = (content: string): boolean => {
  try {
    JSON.parse(content)
    return true
  } catch (_) {
    // do nothing
  }

  return false
}

export const isYaml = (content: string): boolean => {
  try {
    yaml.load(content)
    return true
  } catch (_) {
    // do nothing
  }

  return false
}

export const codeMirrorMode = (
  content: string
): 'application/json' | 'text/yaml' | 'default' => {
  if (isJson(content)) return 'application/json'
  else if (isYaml(content)) return 'text/yaml'
  else return 'default'
}

export const yamlToJson = (content: string): string => {
  if (isYaml(content)) {
    return JSON.stringify(yaml.load(content), null, 2)
  }
  return content
}

export const formatResponse = (val: unknown): string => {
  if (typeof val === 'string') {
    try {
      const obj = JSON.parse(val)
      return JSON.stringify(obj, null, 2)
    } catch (_) {
      return val
    }
  } else {
    try {
      return JSON.stringify(val, null, 2)
    } catch (_) {
      return `${val}`
    }
  }
}

export const formatTime = (dayjsFn: typeof dayjs, time: string): string => {
  const result = dayjsFn(time).local().format('YYYY-MM-DD HH:mm:ss')
  if (result === 'Invalid Date') {
    return time
  } else {
    return result
  }
}
