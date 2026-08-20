import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { Column, Task } from "../types";

interface Props {
  task: Task;
  columns: Column[];
  isSaved: boolean;

  onEdit: (task: Task) => void;
  onToggleSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: string) => void;
}

export default function TaskCard({
  task,
  columns,
  isSaved,
  onEdit,
  onToggleSave,
  onDelete,
  onMoveTask,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={1}
      sx={{
        p: 2,
        mb: 1.5,

        cursor: "pointer",

        borderRadius: 2,

        transition: "0.2s",

        "&:hover": {
          boxShadow: 3,
          transform: isDragging
            ? undefined
            : "translateY(-2px)",
        },
      }}
      onClick={() => onEdit(task)}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {task.title}
        </Typography>

        <Box
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: "flex",
            cursor: "grab",
          }}
        >
          <DragIndicatorIcon />
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.5,
          mb: 2,
        }}
      >
        {task.description}
      </Typography>

      <TextField
        select
        fullWidth
        size="small"
        label="Column"
        value={task.columnId}
        sx={{ mb: 2 }}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          onMoveTask(task.id, e.target.value);
        }}
      >
        {columns.map((column) => (
          <MenuItem
            key={column.id}
            value={column.id}
          >
            {column.title}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant={isSaved ? "contained" : "text"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(task);
          }}
        >
          {isSaved ? "Unsave" : "Save"}
        </Button>

        <Button
          size="small"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          Delete
        </Button>
      </Box>
    </Paper>
  );
}