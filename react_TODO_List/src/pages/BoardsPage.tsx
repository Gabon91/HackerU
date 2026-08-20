import { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { Box, Button, Card, CardActions, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { db } from "../firebase";
import type { Board } from "../types";
import { useNavigate } from "react-router-dom";

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "boards"), (snapshot) => {
      const boardsData: Board[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));
      setBoards(boardsData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateBoard = async () => {
    if (!title.trim()) return;

    await addDoc(collection(db, "boards"), {
      title: title.trim(),
    });

    setTitle("");
    setOpen(false);
  };

  const handleDeleteBoard = async (boardId: string) => {
    await deleteDoc(doc(db, "boards", boardId));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4"> Boards </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}> Add Board </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2 }}>
        {boards.map((board) => (
          <Card key={board.id}>
            <CardContent>
              <Typography variant="h6"> {board.title} </Typography>
            </CardContent>

            <CardActions>
              <Button onClick={() => navigate(`/boards/${board.id}`)}> Open </Button>
              <Button color="error" onClick={() => handleDeleteBoard(board.id)}> Delete </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle> Create Board </DialogTitle>

        <DialogContent>
          <TextField autoFocus fullWidth label="Board Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}> Cancel </Button>
          <Button variant="contained" onClick={handleCreateBoard}> Create </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}