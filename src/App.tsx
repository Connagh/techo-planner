import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import {
  MONTHS,
  addDays,
  addMonths,
  formatRange,
  isToday,
  today,
  weekDates,
} from './lib/dates'
import { PlannerProvider } from './lib/store'
import { MonthView } from './components/MonthView'
import { WeekView } from './components/WeekView'
import { DayView } from './components/DayView'
import { BackupMenu } from './components/BackupMenu'
import { tokens, serif } from './theme'

type View = 'day' | 'week' | 'month'

const VIEWS: { id: View; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

function App() {
  const [view, setView] = useState<View>('day')
  const [cursor, setCursor] = useState<Date>(today())

  const shift = (dir: number) => {
    setCursor((c) =>
      view === 'day'
        ? addDays(c, dir)
        : view === 'week'
          ? addDays(c, dir * 7)
          : addMonths(c, dir),
    )
  }

  const goToday = () => setCursor(today())

  const selectDay = (d: Date) => {
    setCursor(d)
    setView('day')
  }

  // Keyboard shortcuts (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft') shift(-1)
      else if (e.key === 'ArrowRight') shift(1)
      else if (e.key === 't' || e.key === 'T') goToday()
      else if (e.key === 'd' || e.key === 'D') setView('day')
      else if (e.key === 'w' || e.key === 'W') setView('week')
      else if (e.key === 'm' || e.key === 'M') setView('month')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  let periodLabel: string
  if (view === 'week') {
    const days = weekDates(cursor)
    periodLabel = formatRange(days[0], days[6])
  } else {
    periodLabel = `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
  }

  const showingToday =
    view === 'day'
      ? isToday(cursor)
      : view === 'week'
        ? weekDates(cursor).some(isToday)
        : cursor.getMonth() === today().getMonth() &&
          cursor.getFullYear() === today().getFullYear()

  return (
    <PlannerProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundImage: `radial-gradient(${tokens.lineStrong} 0.5px, transparent 0.5px)`,
          backgroundSize: '22px 22px',
          backgroundPosition: '-1px -1px',
        }}
      >
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: { sm: 'space-between' },
            gap: 2,
            px: { xs: 2.5, sm: 4 },
            pt: { xs: 2.5, sm: 3 },
            pb: 2,
          }}
        >
          {/* Wordmark */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
            <Typography
              component="h1"
              sx={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em', color: 'text.primary' }}
            >
              techo
            </Typography>
            <Box sx={{ width: 6, height: 6, transform: 'translateY(-2px)', borderRadius: '50%', bgcolor: 'primary.main' }} />
            <Box component="span" lang="ja" aria-hidden="true" sx={{ fontSize: 13, color: 'text.disabled' }}>
              手帳
            </Box>
          </Box>

          {/* Date navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton onClick={() => shift(-1)} aria-label="Previous" sx={{ color: 'text.secondary' }}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <Typography
              sx={{
                fontFamily: serif,
                minWidth: 170,
                textAlign: 'center',
                fontSize: 15,
                letterSpacing: '-0.01em',
                color: 'text.primary',
              }}
            >
              {periodLabel}
            </Typography>
            <IconButton onClick={() => shift(1)} aria-label="Next" sx={{ color: 'text.secondary' }}>
              <ChevronRightRoundedIcon />
            </IconButton>
            <Button
              onClick={goToday}
              disabled={showingToday}
              variant="outlined"
              sx={{
                ml: 1,
                borderRadius: 99,
                px: 1.5,
                py: 0.5,
                minWidth: 0,
                fontSize: 12,
                color: 'text.secondary',
                borderColor: tokens.line,
                '&:hover': { borderColor: tokens.lineStrong, bgcolor: 'transparent', color: 'text.primary' },
                '&.Mui-disabled': { opacity: 0.4, borderColor: tokens.line, color: 'text.secondary' },
              }}
            >
              Today
            </Button>
          </Box>

          {/* View switcher + backup */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              exclusive
              value={view}
              onChange={(_, v: View | null) => v && setView(v)}
              sx={{
                border: `1px solid ${tokens.line}`,
                borderRadius: 99,
                bgcolor: 'background.paper',
                p: 0.5,
                gap: 0.5,
                '& .MuiToggleButtonGroup-grouped': {
                  border: 0,
                  borderRadius: '99px !important',
                  m: 0,
                  px: 1.75,
                  py: 0.5,
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
                  '&.Mui-selected': {
                    bgcolor: 'text.primary',
                    color: 'background.default',
                    '&:hover': { bgcolor: 'text.primary' },
                  },
                },
              }}
            >
              {VIEWS.map((v) => (
                <ToggleButton key={v.id} value={v.id} disableRipple>
                  {v.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <BackupMenu />
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: { xs: 'auto', lg: 'hidden' },
            WebkitOverflowScrolling: 'touch',
            px: { xs: 2.5, sm: 4 },
            pb: 3,
          }}
        >
          <Box sx={{ height: { xs: 'auto', lg: '100%' } }}>
            {view === 'day' && <DayView cursor={cursor} />}
            {view === 'week' && <WeekView cursor={cursor} onSelectDay={selectDay} />}
            {view === 'month' && <MonthView cursor={cursor} onSelectDay={selectDay} />}
          </Box>
        </Box>
      </Box>
    </PlannerProvider>
  )
}

export default App
