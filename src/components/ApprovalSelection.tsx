import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

interface ApprovalSelectionProps {
  id: string;
}

export default function ApprovalSelection({id} : ApprovalSelectionProps) {
  return (
  <RadioGroup
    aria-labelledby={`${id}-label`}
    defaultValue=""
    name="radio-buttons-group">
      <FormControlLabel value="approve" control={<Radio />} label="Approve"   sx={{
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
    },
  }}/>
      <FormControlLabel value="reject" control={<Radio />} label="Reject"   sx={{
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
    },
  }}/>
  </RadioGroup>);
}
  
