import {
    Box,
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { auditTrailURL, authorizedFetch, handleEgressResponse } from "../api";
import { NetworkError } from "../errors";
import type { EgressAuditTrailEntry } from "../interfaces/EgressAuditTrail";

interface AuditTrailDialogProps {
  projectId: string;
  fileId: string;
  open: boolean;
  onClose(): void;
}

export default function AuditTrailDialog({
  projectId,
  fileId,
  open,
  onClose,
}: AuditTrailDialogProps) {
  const [auditTrail, setAuditTrail] = useState<Array<EgressAuditTrailEntry>>(
    [],
  );

const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {
    if (!open) return;
    authorizedFetch(auditTrailURL(projectId))
      .then((r) => handleEgressResponse<EgressAuditTrailEntry[] | null>(r))
      .then((data) => {
        if (!data) {
          return;
        }
        setAuditTrail(data.filter((value) => value.file_id === fileId));
      })
      .catch((e) => {
        setErrorMessage(e.message);
      });
  }, [projectId, fileId, open]);
    return (
        <Dialog open={open} onClose={onClose}>
        {errorMessage ? (<Paper sx={{p : 2}}>
            <Typography variant="h6">{errorMessage}</Typography>
        </Paper>
        ) :
        (<TableContainer component={Paper}>
            <Table aria-label="File Audit History">
            <TableHead>
                <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Comment</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {auditTrail.map((audit) => (
                <TableRow key={audit.datetime}>
                    <TableCell component="th" scope="row">
                    {audit.action}
                    </TableCell>
                    <TableCell>{audit.datetime}</TableCell>
                    <TableCell>{audit.user_id}</TableCell>
                    <TableCell>{audit.comment}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>)}
        </Dialog>
    );
}
