import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

interface Props {
  open: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function ColumnDialog({
  open,
  title,
  onTitleChange,
  onClose,
  onCreate,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Column</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Column Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onCreate}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}