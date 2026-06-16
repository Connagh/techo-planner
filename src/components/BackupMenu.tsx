import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import BackupRoundedIcon from '@mui/icons-material/BackupRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { usePlanner } from '../lib/store'
import { useSync } from '../lib/sync'
import { key, today } from '../lib/dates'

function relativeTime(ts: number | null): string {
  if (!ts) return ''
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function BackupMenu() {
  const planner = usePlanner()
  const sync = useSync()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState<unknown>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const open = Boolean(anchor)

  const handleExport = () => {
    const json = JSON.stringify(planner.exportData(), null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `techo-backup-${key(today())}.json`
    a.click()
    URL.revokeObjectURL(url)
    setAnchor(null)
    setStatus('Backup downloaded')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    setAnchor(null)
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setPending(JSON.parse(String(reader.result)))
      } catch {
        setStatus("That file isn't valid JSON")
      }
    }
    reader.readAsText(file)
  }

  const confirmRestore = () => {
    const ok = planner.importData(pending)
    setPending(null)
    setStatus(ok ? 'Backup restored' : "That file isn't a valid backup")
  }

  const confirmDeleteAll = async () => {
    setDeleting(true)
    let cloudOk = true
    if (connected) {
      try {
        await sync.deleteCloud()
      } catch {
        cloudOk = false
      }
    }
    planner.clearAll()
    setDeleting(false)
    setConfirmDelete(false)
    setStatus(
      cloudOk
        ? 'All planner data deleted'
        : 'Local data cleared. Remove the Google Drive copy manually.',
    )
  }

  // --- Cloud sync section ---------------------------------------------------

  const syncConfigured = sync.status !== 'off'
  const connected =
    sync.status === 'idle' || sync.status === 'syncing' || sync.status === 'error'

  const connectDrive = async () => {
    setAnchor(null)
    await sync.connect()
  }

  const renderSync = () => {
    if (!syncConfigured) return null

    if (sync.status === 'connecting') {
      return (
        <MenuItem disabled sx={{ py: 1.25 }}>
          <ListItemIcon>
            <CircularProgress size={16} thickness={5} />
          </ListItemIcon>
          <ListItemText
            primary="Connecting…"
            slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 500 } } }}
          />
        </MenuItem>
      )
    }

    if (!connected) {
      return (
        <MenuItem onClick={connectDrive} sx={{ py: 1.25 }}>
          <ListItemIcon>
            <CloudOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Connect Google Drive"
            secondary="Sync across your devices"
            slotProps={{
              primary: { sx: { fontSize: 13, fontWeight: 500 } },
              secondary: { sx: { fontSize: 11 } },
            }}
          />
        </MenuItem>
      )
    }

    const isError = sync.status === 'error'
    const isSyncing = sync.status === 'syncing'
    const statusLine = isError
      ? sync.error || 'Sync error'
      : isSyncing
        ? 'Syncing…'
        : sync.lastSyncedAt
          ? `Synced ${relativeTime(sync.lastSyncedAt)}`
          : 'Connected'

    return (
      <>
        <Box sx={{ px: 2, pt: 1.25, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          {isError ? (
            <CloudOffOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
          ) : (
            <CloudDoneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          )}
          <Typography
            variant="body2"
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: isError ? 'warning.main' : 'text.primary',
            }}
          >
            Google Drive
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 11, color: 'text.disabled', ml: 'auto' }}>
            {statusLine}
          </Typography>
        </Box>
        <MenuItem
          onClick={() => {
            setAnchor(null)
            void sync.syncNow()
          }}
          disabled={isSyncing}
          sx={{ py: 1 }}
        >
          <ListItemIcon>
            <SyncRoundedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Sync now"
            slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 500 } } }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null)
            sync.disconnect()
            setStatus('Disconnected from Google Drive')
          }}
          sx={{ py: 1 }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Disconnect"
            slotProps={{ primary: { sx: { fontSize: 13, color: 'text.secondary' } } }}
          />
        </MenuItem>
      </>
    )
  }

  return (
    <>
      <Tooltip title="Backup & data">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="Backup & data"
          aria-expanded={open}
          sx={{ color: open ? 'text.primary' : 'text.secondary' }}
        >
          <BackupRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 264,
              border: (t) => `1px solid ${t.palette.divider}`,
              boxShadow: '0 10px 40px -12px rgba(32,32,29,0.3)',
            },
          },
        }}
      >
        {syncConfigured && renderSync()}
        {syncConfigured && <Divider />}

        <Typography
          variant="body2"
          sx={{ px: 2, pt: 1.25, pb: 1, color: 'text.disabled', fontSize: 11, lineHeight: 1.6 }}
        >
          {connected
            ? 'Your planner also saves in this browser. Export a backup to keep an extra copy.'
            : 'Your planner is saved in this browser. Export a backup to keep a copy or move it to another device.'}
        </Typography>
        <Divider />
        <MenuItem onClick={handleExport} sx={{ py: 1.25 }}>
          <ListItemIcon>
            <FileDownloadOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Export backup"
            secondary="Download a .json file"
            slotProps={{
              primary: { sx: { fontSize: 13, fontWeight: 500 } },
              secondary: { sx: { fontSize: 11 } },
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => fileInput.current?.click()} sx={{ py: 1.25 }}>
          <ListItemIcon>
            <FileUploadOutlinedIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText
            primary="Restore backup"
            secondary="Replace from a .json file"
            slotProps={{
              primary: { sx: { fontSize: 13, fontWeight: 500 } },
              secondary: { sx: { fontSize: 11 } },
            }}
          />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null)
            setConfirmDelete(true)
          }}
          sx={{ py: 1.25, color: 'error.main', '&:hover': { bgcolor: 'error.50' } }}
        >
          <ListItemIcon>
            <DeleteOutlineRoundedIcon sx={{ fontSize: 20, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText
            primary="Delete all data"
            secondary={connected ? 'From this browser and Google Drive' : 'From this browser'}
            slotProps={{
              primary: { sx: { fontSize: 13, fontWeight: 500, color: 'error.main' } },
              secondary: { sx: { fontSize: 11 } },
            }}
          />
        </MenuItem>
      </Menu>

      <Dialog open={pending !== null} onClose={() => setPending(null)}>
        <DialogTitle sx={{ fontSize: 17 }}>Restore this backup?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14 }}>
            This will replace everything currently in your planner. This can't
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPending(null)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button onClick={confirmRestore} variant="contained" disableElevation>
            Restore
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)}>
        <DialogTitle sx={{ fontSize: 17 }}>Delete all planner data?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14 }}>
            {connected
              ? 'This permanently erases everything in this browser and the copy in your Google Drive. It cannot be undone.'
              : 'This permanently erases everything saved in this browser. It cannot be undone.'}
            {' '}
            Consider exporting a backup first.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteAll}
            disabled={deleting}
            color="error"
            variant="contained"
            disableElevation
            startIcon={deleting ? <CircularProgress size={15} color="inherit" /> : undefined}
          >
            {deleting ? 'Deleting…' : 'Delete everything'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={status !== null}
        autoHideDuration={2600}
        onClose={() => setStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={status}
      />

      <Box
        component="input"
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        sx={{ display: 'none' }}
      />
    </>
  )
}
