import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import { formatLong, isToday, key, weekNumber } from '../lib/dates'
import { usePlanner } from '../lib/store'
import { TaskList } from './TaskList'
import { SectionLabel } from './SectionLabel'
import { Textarea } from './Textarea'
import { tokens, serif } from '../theme'

interface DayViewProps {
  cursor: Date
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6 → 22

function hourLabel(h: number): { n: string; ap: string } {
  const ap = h < 12 ? 'am' : 'pm'
  const n = h % 12 === 0 ? 12 : h % 12
  return { n: String(n), ap }
}

const numSx = { fontFamily: serif, fontVariantNumeric: 'lining-nums tabular-nums' }

/** Tracks the current hour and re-renders at each hour boundary. */
function useNowHour(): number {
  const [nowHour, setNowHour] = useState(() => new Date().getHours())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const schedule = () => {
      const now = new Date()
      const msUntilNextHour =
        (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1000 - now.getMilliseconds()
      timer = setTimeout(() => {
        setNowHour(new Date().getHours())
        schedule()
      }, msUntilNextHour)
    }

    schedule()
    return () => clearTimeout(timer)
  }, [])

  return nowHour
}

export function DayView({ cursor }: DayViewProps) {
  const planner = usePlanner()
  const k = key(cursor)
  const day = planner.getDay(k)
  const counts = planner.taskCounts(k)
  const allDone = counts.total > 0 && counts.done === counts.total
  const td = isToday(cursor)
  const nowHour = useNowHour()

  return (
    <Box
      sx={{
        mx: 'auto',
        height: { xs: 'auto', lg: '100%' },
        maxWidth: 1024,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="header"
        sx={{
          mb: 2.5,
          pb: 1.5,
          borderBottom: `1px solid ${tokens.line}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'text.disabled',
          }}
        >
          <span>Week {weekNumber(cursor)}</span>
          {td && (
            <Chip
              label="Today"
              size="small"
              sx={{
                height: 18,
                fontSize: 9,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                bgcolor: tokens.vermilionSoft,
                color: 'primary.main',
                '& .MuiChip-label': { px: 0.75, py: 0 },
              }}
            />
          )}
        </Box>
        <Typography
          component="h2"
          sx={{ ...numSx, mt: 0.5, fontSize: 26, fontWeight: 300, lineHeight: 1, color: 'text.primary' }}
        >
          {formatLong(cursor)}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: { xs: '0 1 auto', lg: 1 },
          minHeight: { lg: 0 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1.1fr' },
          gap: 4,
        }}
      >
        {/* Left: focus + notes */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: { lg: 0 } }}>
          <Box component="section">
            <SectionLabel
              hint="Your tasks for the day. Click the box to mark one done. It fills in and gets crossed out. Click the text to edit, or use × to remove."
              right={
                counts.total > 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      fontSize: 11,
                      fontWeight: 500,
                      color: allDone ? 'primary.main' : 'text.disabled',
                    }}
                  >
                    {allDone && (
                      <Box component="svg" width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                        <path
                          d="M3 8.5L6.2 12 13 4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Box>
                    )}
                    <Box component="span" sx={{ ...numSx, fontSize: 12 }}>
                      {counts.done}/{counts.total}
                    </Box>
                    <Box component="span" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      done
                    </Box>
                  </Box>
                ) : undefined
              }
            >
              Focus
            </SectionLabel>
            <TaskList dateKey={k} placeholder="What needs doing today?" />
          </Box>

          <Box
            component="section"
            sx={{
              flex: { lg: 1 },
              minHeight: { lg: 160 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SectionLabel hint="A free space for journaling, reflections, or a single 'line a day' to remember how it went.">
              Notes
            </SectionLabel>
            <Textarea
              value={day.note}
              onChange={(e) => planner.setNote(k, e.target.value)}
              placeholder="A line a day. What happened, how it felt…"
              sx={{
                flex: { lg: 1 },
                minHeight: { xs: 120, lg: 160 },
                borderRadius: 3,
                border: `1px solid ${tokens.line}`,
                bgcolor: 'background.paper',
                p: 2,
                fontSize: 15,
                lineHeight: 1.6,
                '&:focus': { borderColor: tokens.lineStrong },
              }}
            />
          </Box>
        </Box>

        {/* Right: hourly timeline */}
        <Box component="section" sx={{ display: 'flex', flexDirection: 'column', minHeight: { lg: 0 } }}>
          <SectionLabel hint="An hourly timeline from 6am to 10pm. Add a note for each hour. On today, the current hour is marked in red.">
            Schedule
          </SectionLabel>
          <Box
            sx={{
              flex: { lg: 1 },
              minHeight: { lg: 0 },
              overflowY: { xs: 'visible', lg: 'auto' },
              borderRadius: 3,
              border: `1px solid ${tokens.line}`,
              bgcolor: 'background.paper',
            }}
          >
            {HOURS.map((h) => {
              const active = td && h === nowHour
              const { n, ap } = hourLabel(h)
              return (
                <Box
                  key={h}
                  sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    borderBottom: `1px solid ${tokens.line}`,
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'flex-end',
                      gap: 0.25,
                      py: 1.25,
                      pr: 1.5,
                    }}
                  >
                    <Box component="span" sx={{ ...numSx, fontSize: 15, color: active ? 'primary.main' : 'text.secondary' }}>
                      {n}
                    </Box>
                    <Box component="span" sx={{ fontSize: 10, textTransform: 'uppercase', color: 'text.disabled' }}>
                      {ap}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <InputBase
                      value={day.schedule[h] ?? ''}
                      onChange={(e) => planner.setSchedule(k, h, e.target.value)}
                      sx={{
                        width: '100%',
                        fontSize: 14,
                        lineHeight: 1.4,
                        color: 'text.primary',
                        boxShadow: active
                          ? `inset 2px 0 0 ${tokens.vermilion}`
                          : `inset 1px 0 0 ${tokens.line}`,
                        '& input': { px: 1.5, py: 1.25 },
                        '&.Mui-focused': { bgcolor: 'background.default' },
                      }}
                    />
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
