import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import { tokens } from '../theme'

interface CheckProps {
  checked: boolean
  onChange: () => void
  size?: number
  label?: string
}

function CheckGlyph({ filled, size }: { filled: boolean; size: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '5px',
        border: `1px solid ${filled ? tokens.vermilion : tokens.lineStrong}`,
        backgroundColor: filled ? tokens.vermilion : 'transparent',
        transition: 'all .15s ease',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 16 16"
        sx={{ width: size - 5, height: size - 5, opacity: filled ? 1 : 0 }}
        aria-hidden="true"
      >
        <path
          d="M3 8.5L6.2 12 13 4.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
    </Box>
  )
}

export function Check({ checked, onChange, size = 16, label }: CheckProps) {
  return (
    <Checkbox
      checked={checked}
      onChange={() => onChange()}
      icon={<CheckGlyph filled={false} size={size} />}
      checkedIcon={<CheckGlyph filled size={size} />}
      slotProps={{
        input: { 'aria-label': label ?? (checked ? 'Mark as not done' : 'Mark as done') },
      }}
      sx={{ p: 0 }}
    />
  )
}
