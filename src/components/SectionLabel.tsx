import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Hint } from './Hint'

interface SectionLabelProps {
  children: ReactNode
  hint?: string
  hintAlign?: 'left' | 'right'
  /** Optional content pinned to the right of the row (e.g. progress). */
  right?: ReactNode
  component?: 'h2' | 'h3'
  /** Bottom margin (theme spacing units). */
  mb?: number
}

const labelSx = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.14em',
  color: 'text.disabled',
  lineHeight: 1.2,
}

export function SectionLabel({
  children,
  hint,
  hintAlign = 'left',
  right,
  component = 'h3',
  mb = 1.25,
}: SectionLabelProps) {
  return (
    <Box
      sx={{
        mb,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography component={component} sx={labelSx}>
          {children}
        </Typography>
        {hint && <Hint text={hint} align={hintAlign} />}
      </Box>
      {right}
    </Box>
  )
}
