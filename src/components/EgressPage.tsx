import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  type SnackbarCloseReason,
} from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router";
import { downloadFileURL, authorizedFetch } from "../api";
import { useEgressFiles } from "../hooks/useEgressFiles";
import EgressFileRow from "./EgressFileRow";
import { FeedbackSnackbar } from "./FeedbackSnackbar";
import BEErrorModel from "./BEErrorModal";
import AuditTrailDialog from "./AuditTrail";
import { getErrorMessage } from "../utils";

export default function EgressPage() {
  const { id } = useParams();
  const projectId = id ?? "";
  const {
    files,
    approvals,
    comments,
    savedApprovals,
    error,
    setApproval,
    setComment,
    save,
  } = useEgressFiles(projectId);

  const [auditTrailDialogState, setAuditTrailDialogState] = useState<{
    open: boolean;
    fileId: string;
  }>({
    open: false,
    fileId: "0",
  });
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  const handleSnackbarClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") return;
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    const result = await save();
    setSnackbarState({
      open: true,
      message: result.message,
      severity: result.ok ? "success" : "error",
    });
  };

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const r = await authorizedFetch(downloadFileURL(projectId, fileId), {
        method: "GET",
      });
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setSnackbarState({
        open: true,
        message: getErrorMessage(e),
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TableContainer component={Paper}>
        <Table aria-label="Table of files to egress">
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Approval Status</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((f) => (
              <EgressFileRow
                key={f.id}
                file={f}
                approval={approvals[f.id]}
                comment={comments[f.id]}
                isSavedApproved={savedApprovals[f.id] === "approve"}
                onApprovalChange={setApproval}
                onCommentChange={setComment}
                onDownload={downloadFile}
                onViewAuditTrail={(fileId) =>
                  setAuditTrailDialogState({ open: true, fileId })
                }
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          data-testid="saveButton"
        >
          Save
        </Button>
        <FeedbackSnackbar {...snackbarState} onClose={handleSnackbarClose} />
      </Box>

      <BEErrorModel
        open={!!error}
        handleClose={() => {}}
        message={error ?? ""}
      />
      <AuditTrailDialog
        projectId={projectId}
        open={auditTrailDialogState.open}
        fileId={auditTrailDialogState.fileId}
        onClose={() => setAuditTrailDialogState({ open: false, fileId: "0" })}
      />
    </Box>
  );
}
