import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import {
  MONTHS,
  WEEKDAYS,
  isToday,
  key,
  startOfWeek,
  weekDates,
} from '../lib/dates'
import { usePlanner } from '../lib/store'
import { TaskList } from './TaskList'
import { Hint } from './Hint'
import { Textarea } from './Textarea'
import { tokens, serif } from '../theme'

interface WeekViewProps {
  cursor: Date
  onSelectDay: (d: Date) => void
}

const labelSx = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.14em',
}

export function WeekView({ cursor, onSelectDay }: WeekViewProps) {
  const planner = usePlanner()
  const days = weekDates(cursor)
  const weekKey = key(startOfWeek(cursor))

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gridAutoRows: '1fr',
        gap: 1.5,
      }}
    >
      {days.map((d) => {
        const k = key(d)
        const td = isToday(d)
        const sunday = d.getDay() === 0
        return (
          <Box
            key={k}
            component="section"
            sx={{
              minHeight: 176,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              border: `1px solid ${td ? 'rgba(192,73,47,0.4)' : tokens.line}`,
              bgcolor: 'background.paper',
              p: 1.75,
            }}
          >
            <ButtonBase
              onClick={() => onSelectDay(d)}
              focusRipple
              sx={{
                mb: 1.25,
                pb: 1,
                borderBottom: `1px solid ${tokens.line}`,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                textAlign: 'left',
                '&:hover .wk-day-num': { color: 'primary.main' },
              }}
            >
              <Box component="span" sx={{ ...labelSx, color: sunday ? 'rgba(192,73,47,0.8)' : 'text.disabled' }}>
                {WEEKDAYS[d.getDay()]}
              </Box>
              <Box component="span" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                <Box
                  component="span"
                  className="wk-day-num"
                  sx={{
                    fontFamily: serif,
                    fontVariantNumeric: 'lining-nums tabular-nums',
                    fontSize: 18,
                    lineHeight: 1,
                    color: td || sunday ? 'primary.main' : 'text.primary',
                    transition: 'color .15s',
                  }}
                >
                  {d.getDate()}
                </Box>
                <Box component="span" sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.disabled' }}>
                  {MONTHS[d.getMonth()].slice(0, 3)}
                </Box>
              </Box>
            </ButtonBase>
            <Box sx={{ flex: 1 }}>
              <TaskList dateKey={k} placeholder="—" compact />
            </Box>
          </Box>
        )
      })}

      {/* Weekly focus fills the 8th cell of the spread */}
      <Box
        component="section"
        sx={{
          minHeight: 176,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: `1px dashed ${tokens.lineStrong}`,
          bgcolor: 'background.default',
          p: 1.75,
        }}
      >
        <Box
          sx={{
            mb: 1.25,
            pb: 1,
            borderBottom: `1px solid ${tokens.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box component="span" sx={{ ...labelSx, color: 'text.disabled' }}>
            This week
          </Box>
          <Hint
            align="right"
            text="A spot for the week's theme or loose notes. Tap any day's date to open its full daily page; add quick tasks right inside each day."
          />
        </Box>
        <Textarea
          value={planner.weekNote(weekKey)}
          onChange={(e) => planner.setWeekNote(weekKey, e.target.value)}
          placeholder="Focus, reflections, notes…"
          sx={{ flex: 1, fontSize: 13, lineHeight: 1.6 }}
        />
      </Box>
    </Box>
  )
}
