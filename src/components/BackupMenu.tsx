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
import BackupRoundedIcon from '@mui/icons-material/BackupRounded'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { usePlanner } from '../lib/store'
import { key, today } from '../lib/dates'

export function BackupMenu() {
  const planner = usePlanner()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [pending, setPending] = useState<unknown>(null)
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
        <Typography
          variant="body2"
          sx={{ px: 2, pt: 1.25, pb: 1, color: 'text.disabled', fontSize: 11, lineHeight: 1.6 }}
        >
          Your planner is saved in this browser. Export a backup to keep a copy
          or move it to another device.
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
