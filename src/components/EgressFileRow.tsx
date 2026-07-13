import { Button, Stack, TableCell, TableRow, TextField } from "@mui/material";
import type { EgressFile } from "../interfaces/EgressFile";
import ApprovalSelection from "./ApprovalSelection";

interface Props {
  file: EgressFile;
  approval: string;
  comment: string;
  isSavedApproved: boolean;
  onApprovalChange: (fileId: string, value: string) => void;
  onCommentChange: (fileId: string, value: string) => void;
  onDownload: (fileId: string, filename: string) => void;
  onViewAuditTrail: (fileId: string) => void;
}

export default function EgressFileRow({
  file,
  approval,
  comment,
  isSavedApproved,
  onApprovalChange,
  onCommentChange,
  onDownload,
  onViewAuditTrail,
}: Props) {
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {file.file_name}
      </TableCell>
      <TableCell>{file.size}</TableCell>
      <TableCell>
        <ApprovalSelection
          id={file.id}
          value={approval}
          onChange={(value) => onApprovalChange(file.id, value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          variant="standard"
          value={comment}
          onChange={(e) => onCommentChange(file.id, e.target.value)}
        />
      </TableCell>
      <TableCell>
        <Stack spacing={1}>
          <Button
            variant="contained"
            onClick={() =>
              isSavedApproved && onDownload(file.id, file.file_name)
            }
            disabled={!isSavedApproved}
            data-testid={`view-${file.id}`}
          >
            Download
          </Button>
          <Button
            variant="contained"
            onClick={() => onViewAuditTrail(file.id)}
            data-testid={`auditTrail-${file.id}`}
          >
            View Audit Trail
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
