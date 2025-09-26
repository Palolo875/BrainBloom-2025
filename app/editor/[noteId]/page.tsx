'use client'

import { NoteEditor } from '@/components/notes/note-editor'

interface EditorPageProps {
  params: { noteId: string }
}

export default function EditorPage({ params }: EditorPageProps) {
  const { noteId } = params
  
  return <NoteEditor noteId={noteId} />
}