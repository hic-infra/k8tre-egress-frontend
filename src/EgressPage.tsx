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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { EgressFile } from "./interfaces/EgressFile";
import ApprovalSelection from "./components/ApprovalSelection";
import { downloadFile, getEgress } from "./apiRoutes";

export default function EgressPage() {
  const [files, setFiles] = useState<EgressFile[]>([]);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(getEgress(id))
        .then((r) => r.json())
        .then(setFiles);
    }
  }, [id]);

  useEffect(() => {
    console.log(files);
  }, [files]);

  return (
    <Box sx={{ p: 2 }}>
      <Box>
        <TableContainer component={Paper}>
          <Table aria-label="Table of files to egress">
            <TableHead>
              <TableCell>Filename</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Approval Status</TableCell>
              <TableCell></TableCell>
            </TableHead>
            <TableBody>
              {files.map((f) => (
                <TableRow key={f.id}>
                  <TableCell component="th" scope="row">
                    {f.file_name}
                  </TableCell>
                  <TableCell>{f.size}</TableCell>
                  <TableCell>
                    <ApprovalSelection id={f.id} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      href={downloadFile(id ?? "", f.id)}
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
        <Button variant="contained">Save</Button>
      </Box>
    </Box>
  );
}
