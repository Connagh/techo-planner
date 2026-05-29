import { useState } from 'react'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { usePlanner } from '../lib/store'
import { Check } from './Check'
import { tokens } from '../theme'

interface TaskListProps {
  dateKey: string
  placeholder?: string
  /** Compact spacing for dense layouts (weekly columns). */
  compact?: boolean
}

export function TaskList({
  dateKey,
  placeholder = 'Add a task',
  compact = false,
}: TaskListProps) {
  const planner = usePlanner()
  const { tasks } = planner.getDay(dateKey)
  const [draft, setDraft] = useState('')

  const fontSize = compact ? 13 : 15
  const checkSize = compact ? 14 : 16

  const commit = () => {
    const text = draft.trim()
    if (text) planner.addTask(dateKey, text)
    setDraft('')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 0.25 : 0.5 }}>
      {tasks.map((task) => (
        <Box
          key={task.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
            '&:hover .task-del': { opacity: 1 },
          }}
        >
          <Box sx={{ mt: '3px' }}>
            <Check
              checked={task.done}
              onChange={() => planner.toggleTask(dateKey, task.id)}
              size={checkSize}
            />
          </Box>
          <InputBase
            value={task.text}
            onChange={(e) => planner.editTask(dateKey, task.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && task.text === '')
                planner.removeTask(dateKey, task.id)
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize,
              lineHeight: 1.4,
              color: task.done ? 'text.disabled' : 'text.primary',
              textDecoration: task.done ? 'line-through' : 'none',
              textDecorationColor: tokens.inkFaint,
              '& input': { p: 0 },
            }}
          />
          <IconButton
            className="task-del"
            onClick={() => planner.removeTask(dateKey, task.id)}
            aria-label="Delete task"
            size="small"
            sx={{
              mt: '1px',
              p: 0.25,
              opacity: 0,
              color: 'text.disabled',
              transition: 'opacity .15s, color .15s',
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      ))}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: checkSize,
            height: checkSize,
            borderRadius: '5px',
            border: `1px dashed ${tokens.lineStrong}`,
            color: 'text.disabled',
            flexShrink: 0,
          }}
        >
          <AddRoundedIcon sx={{ fontSize: compact ? 10 : 11 }} />
        </Box>
        <InputBase
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
          }}
          onBlur={commit}
          placeholder={placeholder}
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize,
            lineHeight: 1.4,
            color: 'text.primary',
            '& input': { p: 0 },
            '& input::placeholder': { color: tokens.inkFaint, opacity: 1 },
          }}
        />
      </Box>
    </Box>
  )
}
