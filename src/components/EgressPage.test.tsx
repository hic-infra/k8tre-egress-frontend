import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import EgressPage from "./EgressPage";
import {
  approveFilesURL,
  auditTrailURL,
  downloadFileURL,
  getEgressURL,
} from "../api";

vi.mock("../keycloak");

const mockFiles = [
  {
    id: "1",
    file_name: "report.csv",
    size: "12KB",
    approvals: [
      { action: "approve", destination: "/", user_id: "3", comment: "Example" },
    ],
  },
  { id: "2", file_name: "data.json", size: "4KB", approvals: [] },
];

const auditTrail = [
  {
    action: "Approval",
    comment: "",
    datetime: "2026-07-07T12:51:10.252099Z",
    destination: "/",
    file_id: "1",
    user_id: "user1",
  },
  {
    action: "Download",
    comment: "",
    datetime: "2026-07-07T12:51:10.284137Z",
    destination: "/",
    file_id: "1",
    user_id: "",
  },
  {
    action: "Rejection",
    comment: "",
    datetime: "2026-07-07T12:51:10.297991Z",
    destination: "/",
    file_id: "1",
    user_id: "user1",
  },
  {
    action: "Approval",
    comment: "",
    datetime: "2026-07-07T12:51:52.456408Z",
    destination: "/",
    file_id: "1",
    user_id: "user1",
  },
  {
    action: "Rejection",
    comment: "",
    datetime: "2026-07-07T12:54:10.297991Z",
    destination: "/",
    file_id: "2",
    user_id: "user1",
  },
];
const server = setupServer(
  http.get(getEgressURL("1"), () => HttpResponse.json(mockFiles)),
  http.put(approveFilesURL("1"), () => HttpResponse.json({ ok: true })),
  http.get(auditTrailURL("1"), () => HttpResponse.json(auditTrail)),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

function renderEgressPage(projectId = "1") {
  return render(
    <MemoryRouter initialEntries={[`/egress/${projectId}`]}>
      <Routes>
        <Route path="/egress/:id" element={<EgressPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EgressPage", () => {
  it("renders files fetched from the API", async () => {
    renderEgressPage();

    await waitFor(() => {
      expect(screen.getByText("report.csv")).toBeInTheDocument();
      expect(screen.getByText("data.json")).toBeInTheDocument();
    });
  });

  it("pre-populates approval state from existing approvals", async () => {
    renderEgressPage();

    await screen.findByText("report.csv");

    const approvedFile = mockFiles[0];
    const unapprovedFile = mockFiles[1];

    const enabledButton = screen.getByTestId(`view-${approvedFile.id}`);
    const unapprovedButton = screen.getByTestId(`view-${unapprovedFile.id}`);

    expect(enabledButton).not.toBeDisabled();
    expect(unapprovedButton).toBeDisabled();
  });

  it("calls PUT with current approvals when Save is clicked", async () => {
    let capturedBody: unknown;
    server.use(
      http.put(approveFilesURL("1"), async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    renderEgressPage();
    await screen.findByText("report.csv");

    // Create a comment
    const approvedFile = mockFiles[0];
    const unapprovedFile = mockFiles[1];
    const commentField = screen.getByTestId(`comment-${approvedFile.id}`);
    const input = commentField.querySelector("input");
    await userEvent.clear(input);

    await userEvent.type(input, "An example comment");

    const commentField2 = screen.getByTestId(`comment-${unapprovedFile.id}`);
    const input2 = commentField2.querySelector("input");
    await userEvent.type(input2, "An example comment");

    await userEvent.click(screen.getByTestId("saveButton"));

    await waitFor(() => {
      expect(capturedBody).toEqual({
        "1": { status: "approve", comment: "An example comment" },
        "2": { status: "reject", comment: "An example comment" },
      });
    });
  });

  it("downloads a file with the correct filename", async () => {
    const anchor = document.createElement("a");
    const clickSpy = vi.spyOn(anchor, "click").mockImplementation(() => {});
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") return anchor;
      return originalCreateElement(tag);
    });
    URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    URL.revokeObjectURL = vi.fn();
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

    server.use(
      http.get(downloadFileURL("1", "1"), () => {
        return new HttpResponse(
          new Blob(["file content"], { type: "application/pdf" }),
          {
            headers: {
              "Content-Disposition": 'attachment; filename="report.csv"',
            },
          },
        );
      }),
    );
    renderEgressPage();
    await screen.findByText("report.csv"); // wait for data to load
    const approvedFile = mockFiles[0];
    const enabledButton = screen.getByTestId(`view-${approvedFile.id}`);
    await userEvent.click(enabledButton);

    expect(anchor.download).toBe("report.csv");
    expect(anchor.href).toBe("blob:mock-url");
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("shows a connection error when the backend is unreachable", async () => {
    server.use(http.get(getEgressURL("1"), () => HttpResponse.error()));
    renderEgressPage();
    await waitFor(() => {
      expect(screen.getByText("Cannot connect to backend")).toBeInTheDocument();
    });
  });

  it("shows an error message when the backend returns a 500", async () => {
    server.use(
      http.get(getEgressURL("1"), () =>
        HttpResponse.json({ detail: "Internal server error" }, { status: 500 }),
      ),
    );
    renderEgressPage();
    await waitFor(() => {
      expect(
        screen.getByText("Request failed: Internal server error"),
      ).toBeInTheDocument();
    });
  });

  it("shows the audit trail when the audit trail button is clicked", async () => {
    renderEgressPage();
    await screen.findByText("report.csv");
    const approvedFile = mockFiles[0];
    const unapprovedFile = mockFiles[1];

    await userEvent.click(screen.getByTestId(`auditTrail-${approvedFile.id}`));

    await waitFor(() => {
      expect(screen.getAllByText("Approval")).toHaveLength(2);
    });

    await userEvent.click(
      screen.getByTestId(`auditTrail-${unapprovedFile.id}`),
    );

    await waitFor(() => {
      expect(screen.getAllByText("Rejection")).toHaveLength(1);
    });

    await waitFor(() => {
      expect(screen.queryByText("Approval")).not.toBeInTheDocument();
    });
  });

  it("shows an error if the audit trail connection fails", async () => {
    server.use(http.get(auditTrailURL("1"), () => HttpResponse.error()));
    renderEgressPage();
    await screen.findByText("report.csv");
    const approvedFile = mockFiles[0];

    await userEvent.click(screen.getByTestId(`auditTrail-${approvedFile.id}`));

    await waitFor(() => {
      expect(
        screen.queryByText("Cannot connect to server"),
      ).toBeInTheDocument();
    });
  });

  it("shows an error if an approval/rejection is submitted with no comment", async () => {
    renderEgressPage();
    await screen.findByText("report.csv");
    const approvedFile = mockFiles[0];

    const container = screen.getByTestId(`approval-${approvedFile.id}`);

    // Get radio buttons within this container
    const rejectRadio = container.querySelector('input[value="reject"]');
    await userEvent.click(rejectRadio);
    const commentField = screen.getByTestId(`comment-${approvedFile.id}`);
    const input = commentField.querySelector("input");
    await userEvent.clear(input);

    await userEvent.click(screen.getByTestId("saveButton"));

    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
