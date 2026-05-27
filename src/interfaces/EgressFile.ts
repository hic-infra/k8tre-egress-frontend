export interface EgressApproval {
    destination: string;
    user_id: string;
}

export interface EgressFile {
  file_name: string;
  id: string;
  size: number;
  approvals: Array<EgressApproval>;
}
