import { Box, Modal, Typography } from "@mui/material";

interface BEErrorModalProps {
  open: boolean;
  handleClose: () => void;
  message: string;
}

export interface BEErrorModalState {
  open: boolean;
  message: string;
}

export default function BEErrorModel({
  open,
  handleClose,
  message,
}: BEErrorModalProps) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Error
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    </Modal>
  );
}
