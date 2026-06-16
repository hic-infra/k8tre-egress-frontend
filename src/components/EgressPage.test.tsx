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
import { approveFiles, getEgress } from "../api";

vi.mock("../keycloak");

const mockFiles = [
  {
    id: "1",
    file_name: "report.csv",
    size: "12KB",
    approvals: [{ destination: "/", user_id: "3" }],
  },
  { id: "2", file_name: "data.json", size: "4KB", approvals: [] },
];

const server = setupServer(
  http.get(getEgress("1"), () => HttpResponse.json(mockFiles)),
  http.put(approveFiles("1"), () => HttpResponse.json({ ok: true })),
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
      http.put(approveFiles("1"), async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    renderEgressPage();
    await screen.findByText("report.csv");

    await userEvent.click(screen.getByTestId("saveButton"));

    await waitFor(() => {
      expect(capturedBody).toEqual({
        "1": { status: "approve", comment: "" },
        "2": { status: "", comment: "" },
      });
    });
  });
});
