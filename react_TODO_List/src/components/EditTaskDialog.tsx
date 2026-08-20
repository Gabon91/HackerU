import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

import type { User } from "../types";

interface Props {
  open: boolean;

  title: string;
  description: string;
  assigneeId: string;

  users: User[];

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;

  onClose: () => void;
  onSave: () => void;
}

export default function EditTaskDialog({
  open,
  title,
  description,
  assigneeId,
  users,
  onTitleChange,
  onDescriptionChange,
  onAssigneeChange,
  onClose,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit Task
      </DialogTitle>

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

        <TextField
          select
          fullWidth
          label="Assignee"
          value={assigneeId}
          onChange={(e) => onAssigneeChange(e.target.value)}
          sx={{ mt: 2 }}
        >
          <MenuItem value="">
            No Assignee
          </MenuItem>

          {users.map((user) => (
            <MenuItem
              key={user.id}
              value={user.id}
            >
              {user.displayName}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSave}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}