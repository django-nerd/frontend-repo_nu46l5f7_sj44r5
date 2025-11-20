import { useEffect } from 'react'
import Editor from '../pages/Editor'

export default function RouteEditorWrapper() {
  // This thin wrapper ensures the editor can pick the id from the URL and remount
  useEffect(() => {}, [])
  return <Editor />
}
