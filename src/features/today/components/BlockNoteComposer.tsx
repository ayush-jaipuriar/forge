import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'

export function BlockNoteComposer({
  note,
  disabled = false,
  onSave,
}: {
  note?: string
  disabled?: boolean
  onSave: (note: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(note ?? '')

  const normalizedDraft = draft.trim()
  const normalizedCurrent = (note ?? '').trim()
  const saveDisabled = disabled || normalizedDraft === normalizedCurrent

  if (!isEditing) {
    return (
      <Stack spacing={1}>
        {note ? (
          <Typography variant="body2" color="text.secondary">
            Note: {note}
          </Typography>
        ) : null}
        <Button
          size="small"
          variant="text"
          startIcon={note ? <EditNoteRoundedIcon /> : <NotesRoundedIcon />}
          disabled={disabled}
          onClick={() => {
            setDraft(note ?? '')
            setIsEditing(true)
          }}
        >
          {note ? 'Edit Note' : 'Add Note'}
        </Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={1.25}>
      <TextField
        label="Execution note"
        multiline
        minRows={2}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        helperText="Fast context for slips, changes, or the next clean move."
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          size="small"
          variant="contained"
          disabled={saveDisabled}
          onClick={() => {
            onSave(draft)
            setIsEditing(false)
          }}
        >
          Save Note
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => {
            setDraft(note ?? '')
            setIsEditing(false)
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  )
}
