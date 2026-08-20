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
  description: string;

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;

  onClose: () => void;
  onCreate: () => void;
}

export default function CreateTaskDialog({
  open,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onClose,
  onCreate,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Task</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Task Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          sx={{ mt: 1 }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          sx={{ mt: 2 }}
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