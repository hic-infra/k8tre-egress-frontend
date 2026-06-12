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
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { EgressFile } from "../interfaces/EgressFile";
import { approveFiles, authorizedFetch, downloadFile, getEgress } from "../api";
import ApprovalSelection from "./ApprovalSelection";
import { FeedbackSnackbar } from "./FeedbackSnackbar";
import type { BEErrorModalState } from "./BEErrorModal";
import { getErrorMessage } from "../utils";
import BEErrorModel from "./BEErrorModal";
import type { EgressError } from "../interfaces/EgressError";

export default function EgressPage() {
  const [files, setFiles] = useState<EgressFile[]>([]);
  const [approvals, setApprovals] = useState<Record<string, string>>({});
  const [savedApprovals, setSavedApprovals] = useState<Record<string, string>>({});
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const handleClose = (_: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    
    setSnackbarState(prev => ({ ...prev, open: false }));
  };

  const [modalState, setModalState] = useState<BEErrorModalState>({
    open: false,
    message: "",
  });

  const { id } = useParams();

  const projectId = id ?? "";

  const handleApprovalChange = (fileId: string, value: string) => {
    setApprovals((prev) => ({ ...prev, [fileId]: value }));
  };

  const saveEgress = () => {
    authorizedFetch(approveFiles(projectId), {
      method: "PUT",
      body: JSON.stringify(approvals),
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.message === "success") {
          setSavedApprovals({ ...approvals });
          setSnackbarState({open: true, message: "Update Successful", severity: 'success'})
        }
      })
      .catch((e) => {
        setSnackbarState({open: true, message: getErrorMessage(e), severity: 'error'})
      });
  };

  useEffect(() => {
    authorizedFetch(getEgress(projectId))
      .then(async (r) => {
        if (r.ok) {
          return r.json();
        } else {
          const message : EgressError = await r.json();
          throw new Error(`Request failed: ${message.detail}`);
        }
      })
      .then((data: EgressFile[] | null) => {
        if (!data) {
          setModalState({ open: true, message: "Fetch failed due to no data" });
          return;
        }
        setFiles(data);
        setApprovals(
          Object.fromEntries(
            data.map((f) => [f.id, f.approvals.length > 0 ? "approve" : ""]),
          ),
        );
        setSavedApprovals(
          Object.fromEntries(
            data.map((f) => [f.id, f.approvals.length > 0 ? "approve" : ""]),
          ),
        );
      })
      .catch((e) => setModalState({ open: true, message: getErrorMessage(e) }));
  }, [projectId]);

  useEffect(() => {
    console.log(files);
  }, [files]);

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
                    <Button
                      variant="contained"
                      href={
                        savedApprovals[f.id] === "approve"
                          ? downloadFile(id ?? "", f.id)
                          : undefined
                      }
                      disabled={savedApprovals[f.id] !== "approve"}
                      data-testid={`view-${f.id}`}
                    >
                      View
                    </Button>
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
        <FeedbackSnackbar {...snackbarState} onClose={handleClose}/>
      </Box>
      <BEErrorModel
        open={modalState.open}
        handleClose={() => {}}
        message={modalState.message}
      />
    </Box>
  );
}
