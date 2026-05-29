import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { tokens } from '../theme'

interface HintProps {
  text: string
  /** Anchoring of the tooltip relative to the icon. */
  align?: 'left' | 'right'
}

/** A small "?" affordance that reveals an explanation on hover or focus. */
export function Hint({ text, align = 'left' }: HintProps) {
  return (
    <Tooltip
      title={text}
      placement={align === 'right' ? 'bottom-end' : 'bottom-start'}
    >
      <Box
        component="span"
        role="button"
        tabIndex={0}
        aria-label="What is this?"
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 15,
          height: 15,
          borderRadius: '50%',
          border: `1px solid ${tokens.lineStrong}`,
          color: tokens.inkFaint,
          fontSize: 10,
          fontWeight: 600,
          lineHeight: 1,
          cursor: 'help',
          transition: 'color .15s, border-color .15s',
          '&:hover, &:focus-visible': {
            color: tokens.vermilion,
            borderColor: tokens.vermilion,
            outline: 'none',
          },
        }}
      >
        ?
      </Box>
    </Tooltip>
  )
}
