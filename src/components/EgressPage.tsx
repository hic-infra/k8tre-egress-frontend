import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  type SnackbarCloseReason,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { EgressFile } from "../interfaces/EgressFile";
import {
  approveFilesURL,
  authorizedFetch,
  downloadFileURL,
  getEgressURL,
  handleEgressResponse,
} from "../api";
import ApprovalSelection from "./ApprovalSelection";
import { FeedbackSnackbar } from "./FeedbackSnackbar";
import type { BEErrorModalState } from "./BEErrorModal";
import { getErrorMessage } from "../utils";
import BEErrorModel from "./BEErrorModal";
import { NetworkError } from "../errors";
import AuditTrailDialog from "./AuditTrail";

export default function EgressPage() {
  const [files, setFiles] = useState<EgressFile[]>([]);
  const [auditTrailDialogState, setAuditTrailDialogState] = useState<{open: boolean; fileId: string;}>({ open: false, fileId: "0" });

  const [approvals, setApprovals] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [savedApprovals, setSavedApprovals] = useState<Record<string, string>>(
    {},
  );
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  const handleSnackbarClose = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") return;

    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const handleAuditTrailClose = () => {
    setAuditTrailDialogState({open: false, fileId: "0"});
  }

  const [modalState, setModalState] = useState<BEErrorModalState>({
    open: false,
    message: "",
  });

  const { id } = useParams();

  const projectId = id ?? "";

  const handleApprovalChange = (fileId: string, value: string) => {
    setApprovals((prev) => ({ ...prev, [fileId]: value }));
  };

  const handleCommentChange = (fileId: string, value: string) => {
    setComments((prev) => ({ ...prev, [fileId]: value }));
  };

  const figureApprovalStatus = (f: EgressFile) => {
    // TODO: Generalize this for mulitple approvals
    return f.approvals.at(0)?.action || "reject"
  }

  const saveEgress = () => {
    const body = Object.fromEntries(
      Object.keys(approvals).map((key) => [
        key,
        { status: approvals[key], comment: comments[key] },
      ]),
    );
    authorizedFetch(approveFilesURL(projectId), {
      method: "PUT",
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.message === "success") {
          setSavedApprovals({ ...approvals });
          setSnackbarState({
            open: true,
            message: "Update Successful",
            severity: "success",
          });
        }
      })
      .catch((e) => {
        setSnackbarState({
          open: true,
          message: getErrorMessage(e),
          severity: "error",
        });
      });
  };

  const downloadFile = async (
    projectId: string,
    fileId: string,
    filename: string,
  ) => {
    authorizedFetch(downloadFileURL(projectId, fileId), {
      method: "GET",
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((e) => {
        setSnackbarState({
          open: true,
          message: getErrorMessage(e),
          severity: "error",
        });
      });
  };

  useEffect(() => {
    authorizedFetch(getEgressURL(projectId))
      .then((r) => handleEgressResponse<EgressFile[] | null>(r))
      .then((data) => {
        if (!data) {
          setModalState({ open: true, message: "Fetch failed due to no data" });
          return;
        }
        setFiles(data);
        const approvalState = Object.fromEntries(
          data.map((f) => [f.id, figureApprovalStatus(f)]),
        );
        setComments(
          Object.fromEntries(
            data.map((f) => [f.id, f.approvals.at(-1)?.comment || ""]),
          ),
        );
        setApprovals(approvalState);
        setSavedApprovals(approvalState);
      })
      .catch((e) => {
        if (e instanceof NetworkError) {
          setModalState({ open: true, message: "Cannot connect to backend" });
        } else {
          setModalState({ open: true, message: getErrorMessage(e) });
        }
      });
  }, [projectId]);


  return (
    <Box sx={{ p: 2 }}>
      <Box>
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
                <TableRow key={f.id}>
                  <TableCell component="th" scope="row">
                    {f.file_name}
                  </TableCell>
                  <TableCell>{f.size}</TableCell>
                  <TableCell>
                    <ApprovalSelection
                      id={f.id}
                      value={approvals[f.id]}
                      onChange={(value) => handleApprovalChange(f.id, value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      id="standard-basic"
                      variant="standard"
                      value={comments[f.id]}
                      onChange={(value) =>
                        handleCommentChange(f.id, value.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={1}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          savedApprovals[f.id] === "approve"
                            ? downloadFile(id ?? "", f.id, f.file_name)
                            : undefined
                        }
                        disabled={savedApprovals[f.id] !== "approve"}
                        data-testid={`view-${f.id}`}
                      >
                        Download
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() =>
                          setAuditTrailDialogState({open: true, fileId: f.id})
                        }
                        data-testid={`auditTrail-${f.id}`}
                      >
                      View Audit Trail
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ p: 2, justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          onClick={saveEgress}
          data-testid={"saveButton"}
        >
          Save
        </Button>
        <FeedbackSnackbar {...snackbarState} onClose={handleSnackbarClose} />
      </Box>
      <BEErrorModel
        open={modalState.open}
        handleClose={() => {}}
        message={modalState.message}
      />
      <AuditTrailDialog projectId={projectId} open={auditTrailDialogState.open} fileId={auditTrailDialogState.fileId} onClose={handleAuditTrailClose} />
    </Box>
  );
}
