import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {Box, Button, Container, Paper, TextField, Typography} from "@mui/material";
import { auth, db } from "../firebase";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          email: user.email,
          displayName: displayName,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error);
      setError("Authentication failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom> {isRegister ? "Register" : "Login"} </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {isRegister && (
            <TextField fullWidth label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} margin="normal" required/>
          )}
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required/>
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required/>

          {error && ( <Typography color="error" sx={{ mt: 2 }}> {error} </Typography>)}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            {isRegister ? "Register" : "Login"}
          </Button>

          <Button fullWidth sx={{ mt: 1 }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}