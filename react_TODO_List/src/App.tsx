import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import { Routes, Route } from "react-router-dom";

import { auth } from "./firebase";
import AuthPage from "./pages/AuthPage";
import BoardsPage from "./pages/BoardsPage";
import BoardPage from "./pages/BoardPage";

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            Advanced TODO
          </Typography>

          <Typography
            variant="body2"
            sx={{ mr: 2 }}
          >
            {user.email}
          </Typography>

          <Button
            color="inherit"
            onClick={() => signOut(auth)}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box>
        <Routes>
          <Route
            path="/"
            element={<BoardsPage />}
          />

          <Route
            path="/boards/:boardId"
            element={<BoardPage />}
          />
        </Routes>
      </Box>
    </>
  );
}

export default App;