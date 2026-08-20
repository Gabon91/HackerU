import {
  Button,
  Paper,
  Typography,
} from "@mui/material";

import { useDroppable } from "@dnd-kit/core";

import TaskCard from "./TaskCard";
import type { Column, Task } from "../types";

interface Props {
  column: Column;
  columns: Column[];
  tasks: Task[];
  currentUserId: string;

  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onToggleSave: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: string) => void;
}

export default function BoardColumn({
  column,
  columns,
  tasks,
  currentUserId,
  onAddTask,
  onEditTask,
  onToggleSave,
  onDeleteTask,
  onMoveTask,
}: Props) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: column.id,
  });

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        p: 2,
        minWidth: 300,
        width: 300,
        minHeight: 250,

        backgroundColor: "#eef1f5",

        border: "2px solid",
        borderColor: isOver
          ? "primary.main"
          : "transparent",

        borderRadius: 3,

        transition: "0.2s",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          px: 1,
        }}
      >
        {column.title}
      </Typography>

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          columns={columns}
          isSaved={task.savedBy.includes(currentUserId)}
          onEdit={onEditTask}
          onToggleSave={onToggleSave}
          onDelete={onDeleteTask}
          onMoveTask={onMoveTask}
        />
      ))}

      <Button
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => onAddTask(column.id)}
      >
        Add Task
      </Button>
    </Paper>
  );
}