import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type SnackbarSeverity = 'success' | 'error';

interface FeedbackSnackbarProps {
  open: boolean;
  severity: SnackbarSeverity;
  message: string;
  onClose: (event: Event | React.SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => void;
}

export function FeedbackSnackbar({ open, severity, message, onClose }: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}