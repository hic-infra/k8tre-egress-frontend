import { useEffect, useState, useCallback } from "react";
import type { EgressFile } from "../interfaces/EgressFile";
import {
  approveFilesURL,
  authorizedFetch,
  getEgressURL,
  handleEgressResponse,
} from "../api";
import { NetworkError } from "../errors";
import { getErrorMessage } from "../utils";

const figureApprovalStatus = (f: EgressFile) =>
  f.approvals.at(0)?.action || "reject";

export function useEgressFiles(projectId: string) {
  const [files, setFiles] = useState<EgressFile[]>([]);
  const [approvals, setApprovals] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [savedApprovals, setSavedApprovals] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authorizedFetch(getEgressURL(projectId))
      .then((r) => handleEgressResponse<EgressFile[] | null>(r))
      .then((data) => {
        if (!data) {
          setError("Fetch failed due to no data");
          return;
        }
        const approvalState = Object.fromEntries(
          data.map((f) => [f.id, figureApprovalStatus(f)]),
        );
        setFiles(data);
        setComments(
          Object.fromEntries(
            data.map((f) => [f.id, f.approvals.at(-1)?.comment || ""]),
          ),
        );
        setApprovals(approvalState);
        setSavedApprovals(approvalState);
      })
      .catch((e) => {
        setError(
          e instanceof NetworkError
            ? "Cannot connect to backend"
            : getErrorMessage(e),
        );
      });
  }, [projectId]);

  const setApproval = useCallback((fileId: string, value: string) => {
    setApprovals((prev) => ({ ...prev, [fileId]: value }));
  }, []);

  const setComment = useCallback((fileId: string, value: string) => {
    setComments((prev) => ({ ...prev, [fileId]: value }));
  }, []);

  const save = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    const body = Object.fromEntries(
      Object.keys(approvals).map((key) => [
        key,
        { status: approvals[key], comment: comments[key] },
      ]),
    );
    try {
      const r = await authorizedFetch(approveFilesURL(projectId), {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (json.message === "success") {
        setSavedApprovals({ ...approvals });
        return { ok: true, message: "Update Successful" };
      }
      return { ok: false, message: "Update failed" };
    } catch (e) {
      return { ok: false, message: getErrorMessage(e) };
    }
  }, [approvals, comments, projectId]);

  return {
    files,
    approvals,
    comments,
    savedApprovals,
    error,
    setApproval,
    setComment,
    save,
  };
}
