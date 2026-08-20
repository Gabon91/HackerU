import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import {
  DndContext,
  closestCorners,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";

import { auth, db } from "../firebase";
import type { Column, Task, User } from "../types";

import BoardColumn from "../components/BoardColumn";
import ColumnDialog from "../components/ColumnDialog";
import CreateTaskDialog from "../components/CreateTaskDialog";
import EditTaskDialog from "../components/EditTaskDialog";


interface TaskForm {
  title: string;
  description: string;
  assigneeId: string;
}

type TaskFilter = "all" | "mine" | "saved";

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  assigneeId: "",
};


export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Task filter
  const [taskFilter, setTaskFilter] =
    useState<TaskFilter>("all");

  // Column
  const [columnDialogOpen, setColumnDialogOpen] =
    useState(false);

  const [columnTitle, setColumnTitle] =
    useState("");

  // Create Task
  const [createTaskDialogOpen, setCreateTaskDialogOpen] =
    useState(false);

  const [selectedColumnId, setSelectedColumnId] =
    useState("");

  // Edit Task
  const [editTaskDialogOpen, setEditTaskDialogOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  // Task form
  const [taskForm, setTaskForm] =
    useState<TaskForm>(emptyTaskForm);


  // Load columns
  useEffect(() => {
    if (!boardId) return;

    const columnsQuery = query(
      collection(db, "columns"),
      where("boardId", "==", boardId)
    );

    const unsubscribe = onSnapshot(
      columnsQuery,
      (snapshot) => {
        const data: Column[] = snapshot.docs.map(
          (document) => ({
            id: document.id,
            boardId: document.data().boardId,
            title: document.data().title,
          })
        );

        setColumns(data);
      }
    );

    return unsubscribe;
  }, [boardId]);


  // Load tasks
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const data: Task[] = snapshot.docs.map(
          (document) => ({
            id: document.id,
            columnId: document.data().columnId,
            title: document.data().title,
            description: document.data().description,
            assigneeId: document.data().assigneeId,
            savedBy: document.data().savedBy ?? [],
          })
        );

        setTasks(data);
      }
    );

    return unsubscribe;
  }, []);


  // Load users
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data: User[] = snapshot.docs.map(
          (document) => ({
            id: document.id,
            email: document.data().email,
            displayName: document.data().displayName,
          })
        );

        setUsers(data);
      }
    );

    return unsubscribe;
  }, []);


  // Create column
  const handleCreateColumn = async () => {
    if (!columnTitle.trim() || !boardId) return;

    await addDoc(
      collection(db, "columns"),
      {
        boardId,
        title: columnTitle.trim(),
      }
    );

    setColumnTitle("");
    setColumnDialogOpen(false);
  };


  // Open Create Task
  const handleOpenCreateTask = (columnId: string) => {
    setSelectedColumnId(columnId);
    setTaskForm(emptyTaskForm);
    setCreateTaskDialogOpen(true);
  };


  // Create Task
  const handleCreateTask = async () => {
    if (!taskForm.title.trim() || !selectedColumnId) {
      return;
    }

    await addDoc(
      collection(db, "tasks"),
      {
        columnId: selectedColumnId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assigneeId: "",
        savedBy: [],
      }
    );

    setTaskForm(emptyTaskForm);
    setSelectedColumnId("");
    setCreateTaskDialogOpen(false);
  };


  // Open Edit Task
  const handleOpenEditTask = (task: Task) => {
    setSelectedTask(task);

    setTaskForm({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
    });

    setEditTaskDialogOpen(true);
  };


  // Update Task
  const handleUpdateTask = async () => {
    if (!selectedTask || !taskForm.title.trim()) {
      return;
    }

    await updateDoc(
      doc(db, "tasks", selectedTask.id),
      {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assigneeId: taskForm.assigneeId,
      }
    );

    setSelectedTask(null);
    setTaskForm(emptyTaskForm);
    setEditTaskDialogOpen(false);
  };


  // Delete Task
  const handleDeleteTask = async (
    taskId: string
  ) => {
    await deleteDoc(
      doc(db, "tasks", taskId)
    );
  };


  // Save / Unsave Task
  const handleToggleSaveTask = async (
    task: Task
  ) => {
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    const isSaved =
      task.savedBy.includes(userId);

    const updatedSavedBy = isSaved
      ? task.savedBy.filter(
          (id) => id !== userId
        )
      : [...task.savedBy, userId];

    await updateDoc(
      doc(db, "tasks", task.id),
      {
        savedBy: updatedSavedBy,
      }
    );
  };


  // Update task form
  const updateTaskForm = (
    field: keyof TaskForm,
    value: string
  ) => {
    setTaskForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  // Move Task using dropdown
  const handleMoveTask = async (
    taskId: string,
    columnId: string
  ) => {
    await updateDoc(
      doc(db, "tasks", taskId),
      {
        columnId,
      }
    );
  };


  // Move Task using Drag & Drop
  const handleDragEnd = async (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = String(active.id);
    const columnId = String(over.id);

    const task = tasks.find(
      (task) => task.id === taskId
    );

    if (!task) return;

    if (task.columnId === columnId) {
      return;
    }

    await handleMoveTask(
      taskId,
      columnId
    );
  };


  // Current logged-in user
  const currentUserId =
    auth.currentUser?.uid ?? "";


  // Filter tasks
  const filteredTasks = tasks.filter(
    (task) => {
      if (taskFilter === "mine") {
        return (
          task.assigneeId === currentUserId
        );
      }

      if (taskFilter === "saved") {
        return task.savedBy.includes(
          currentUserId
        );
      }

      return true;
    }
  );


  return (
    <Container maxWidth={false} sx={{mt: 4,px: {xs: 2,md: 4,},}}>
      <Button
        onClick={() => navigate("/")}
        sx={{ mb: 2 }}
      >
        Back to Boards
      </Button>


      {/* Board Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          Board
        </Typography>

        <Button
          variant="contained"
          onClick={() =>
            setColumnDialogOpen(true)
          }
        >
          Add Column
        </Button>
      </Box>


      {/* Task Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 3,
          p: 1,
          backgroundColor: "white",
          borderRadius: 2,
          width: "fit-content",
        }}
      >
        <Button
          variant={
            taskFilter === "all"
              ? "contained"
              : "outlined"
          }
          onClick={() =>
            setTaskFilter("all")
          }
        >
          All Tasks
        </Button>

        <Button
          variant={
            taskFilter === "mine"
              ? "contained"
              : "outlined"
          }
          onClick={() =>
            setTaskFilter("mine")
          }
        >
          My Tasks
        </Button>

        <Button
          variant={
            taskFilter === "saved"
              ? "contained"
              : "outlined"
          }
          onClick={() =>
            setTaskFilter("saved")
          }
        >
          Saved Tasks
        </Button>
      </Box>


      {/* Columns */}
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            alignItems: "flex-start",
            pb: 2,
            minHeight: "60vh",
          }}
        >
          {columns.map((column) => (
            <BoardColumn
              key={column.id}

              column={column}
              columns={columns}

              tasks={filteredTasks.filter(
                (task) =>
                  task.columnId === column.id
              )}

              currentUserId={
                currentUserId
              }

              onAddTask={
                handleOpenCreateTask
              }

              onEditTask={
                handleOpenEditTask
              }

              onToggleSave={
                handleToggleSaveTask
              }

              onDeleteTask={
                handleDeleteTask
              }

              onMoveTask={
                handleMoveTask
              }
            />
          ))}
        </Box>
      </DndContext>


      {/* Create Column */}
      <ColumnDialog
        open={columnDialogOpen}
        title={columnTitle}

        onTitleChange={
          setColumnTitle
        }

        onClose={() =>
          setColumnDialogOpen(false)
        }

        onCreate={
          handleCreateColumn
        }
      />


      {/* Create Task */}
      <CreateTaskDialog
        open={createTaskDialogOpen}

        title={taskForm.title}

        description={
          taskForm.description
        }

        onTitleChange={(value) =>
          updateTaskForm(
            "title",
            value
          )
        }

        onDescriptionChange={(value) =>
          updateTaskForm(
            "description",
            value
          )
        }

        onClose={() =>
          setCreateTaskDialogOpen(false)
        }

        onCreate={
          handleCreateTask
        }
      />


      {/* Edit Task */}
      <EditTaskDialog
        open={editTaskDialogOpen}

        title={taskForm.title}

        description={
          taskForm.description
        }

        assigneeId={
          taskForm.assigneeId
        }

        users={users}

        onTitleChange={(value) =>
          updateTaskForm(
            "title",
            value
          )
        }

        onDescriptionChange={(value) =>
          updateTaskForm(
            "description",
            value
          )
        }

        onAssigneeChange={(value) =>
          updateTaskForm(
            "assigneeId",
            value
          )
        }

        onClose={() =>
          setEditTaskDialogOpen(false)
        }

        onSave={
          handleUpdateTask
        }
      />
    </Container>
  );
}