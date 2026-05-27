import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

interface ApprovalSelectionProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ApprovalSelection({ id, value, onChange }: ApprovalSelectionProps) {
  return (
    <RadioGroup
      aria-labelledby={`${id}-label`}
      value={value}
      name="radio-buttons-group"
      onChange={(e) => onChange(e.target.value)}
    >
      <FormControlLabel
        value="approve"
        control={<Radio />}
        label="Approve"
        sx={{
          "& .MuiFormControlLabel-label": {
            fontSize: "14px",
          },
        }}
      />
      <FormControlLabel
        value="reject"
        control={<Radio />}
        label="Reject"
        sx={{
          "& .MuiFormControlLabel-label": {
            fontSize: "14px",
          },
        }}
      />
    </RadioGroup>
  );
}
