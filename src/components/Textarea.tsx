import { styled } from '@mui/material/styles'

/** A borderless, transparent textarea that inherits typography and supports sx. */
export const Textarea = styled('textarea')(({ theme }) => ({
  fontFamily: 'inherit',
  border: 'none',
  outline: 'none',
  resize: 'none',
  background: 'transparent',
  color: theme.palette.text.primary,
  width: '100%',
  '&::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
}))
