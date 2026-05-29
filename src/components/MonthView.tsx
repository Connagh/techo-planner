import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { MONTHS, WEEKDAYS, isToday, key, monthGrid } from '../lib/dates'
import { usePlanner } from '../lib/store'
import { stagger, type PageKind } from '../lib/motion'
import { Hint } from './Hint'
import { Textarea } from './Textarea'
import { tokens, serif } from '../theme'

interface MonthViewProps {
  cursor: Date
  entrance?: PageKind
  onSelectDay: (d: Date) => void
}

const numSx = { fontFamily: serif, fontVariantNumeric: 'lining-nums tabular-nums' }
const labelSx = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.14em',
}

export function MonthView({ cursor, entrance = 'zoom', onSelectDay }: MonthViewProps) {
  const planner = usePlanner()
  const grid = monthGrid(cursor)
  const month = cursor.getMonth()
  const monthKey = `${cursor.getFullYear()}-${String(month + 1).padStart(2, '0')}`
  const cascade = entrance === 'zoom'

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, height: { xs: 'auto', lg: '100%' }, gap: 3 }}>
      {/* Calendar */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', ...(cascade ? stagger(0) : null) }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {WEEKDAYS.map((w, i) => (
            <Box
              key={w}
              sx={{ ...labelSx, pb: 1, color: i === 0 ? 'rgba(192,73,47,0.7)' : 'text.disabled' }}
            >
              {w}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            overflow: 'hidden',
            borderRadius: 3,
            border: `1px solid ${tokens.line}`,
            bgcolor: 'background.paper',
          }}
        >
          {grid.map((d, i) => {
            const inMonth = d.getMonth() === month
            const k = key(d)
            const counts = planner.taskCounts(k)
            const day = planner.getDay(k)
            const hasNote = day.note.trim().length > 0
            const sunday = d.getDay() === 0
            const td = isToday(d)
            const lastCol = i % 7 === 6
            const lastRow = i >= 35
            return (
              <ButtonBase
                key={k}
                onClick={() => onSelectDay(d)}
                sx={{
                  minHeight: 84,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 0.5,
                  p: 1,
                  textAlign: 'left',
                  borderRight: lastCol ? 'none' : `1px solid ${tokens.line}`,
                  borderBottom: lastRow ? 'none' : `1px solid ${tokens.line}`,
                  bgcolor: inMonth ? 'transparent' : 'rgba(250,248,242,0.4)',
                  transition: 'background-color .15s',
                  '&:hover': { bgcolor: 'background.default' },
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    component="span"
                    sx={{
                      ...numSx,
                      display: 'grid',
                      placeItems: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      fontSize: 15,
                      lineHeight: 1,
                      ...(td
                        ? { bgcolor: 'primary.main', color: '#fff' }
                        : {
                            color: inMonth
                              ? sunday
                                ? 'primary.main'
                                : 'text.primary'
                              : 'text.disabled',
                          }),
                    }}
                  >
                    {d.getDate()}
                  </Box>
                  {hasNote && !td && (
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(58,74,99,0.5)' }} aria-hidden="true" />
                  )}
                </Box>

                <Box sx={{ display: 'flex', width: '100%', flex: 1, flexDirection: 'column', gap: 0.25, overflow: 'hidden' }}>
                  {day.tasks.slice(0, 2).map((t) => (
                    <Box
                      key={t.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: 11,
                        lineHeight: 1.25,
                        color: t.done ? 'text.disabled' : 'text.secondary',
                        textDecoration: t.done ? 'line-through' : 'none',
                      }}
                    >
                      <Box sx={{ width: 4, height: 4, flexShrink: 0, borderRadius: '50%', bgcolor: t.done ? 'text.disabled' : 'primary.main' }} />
                      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.text || 'Untitled'}
                      </Box>
                    </Box>
                  ))}
                  {counts.total > 2 && (
                    <Box component="span" sx={{ fontSize: 10, color: 'text.disabled' }}>
                      +{counts.total - 2} more
                    </Box>
                  )}
                </Box>
              </ButtonBase>
            )
          })}
        </Box>
      </Box>

      {/* Monthly intentions */}
      <Box component="aside" sx={{ width: { xs: '100%', lg: 256 }, flexShrink: 0, display: 'flex', flexDirection: 'column', ...(cascade ? stagger(1, { base: 120, step: 90 }) : null) }}>
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography component="h2" sx={{ ...labelSx, color: 'text.disabled' }}>
              Intentions
            </Typography>
            <Hint
              align="right"
              text="A few goals or themes for the month. A dot under a date means there is a note that day. Red dots mean open tasks. Click any day to open it."
            />
          </Box>
          <Box component="span" sx={{ ...numSx, fontSize: 13, color: 'text.disabled' }}>
            {MONTHS[month]}
          </Box>
        </Box>
        <Textarea
          value={planner.monthNote(monthKey)}
          onChange={(e) => planner.setMonthNote(monthKey, e.target.value)}
          placeholder="What matters this month?"
          sx={{
            flex: 1,
            minHeight: 160,
            borderRadius: 3,
            border: `1px solid ${tokens.line}`,
            bgcolor: 'background.paper',
            p: 2,
            fontSize: 14,
            lineHeight: 1.6,
            '&:focus': { borderColor: tokens.lineStrong },
          }}
        />
      </Box>
    </Box>
  )
}
