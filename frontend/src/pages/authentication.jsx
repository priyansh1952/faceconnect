import * as React from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Snackbar, Alert, Typography } from "@mui/material";
import axios from "axios";

const defaultTheme = createTheme();

const wallpapers = [
  "/pexels-bri-schneiter-28802-346529.jpg",
  "/pexels-joyston-judah-331625-933054.jpg",
  "/pexels-jplenio-1146708.jpg",
  "/pexels-matthew-montrone-230847-1324803.jpg",
  "/pexels-pedro-figueras-202443-681467.jpg",
  "/pexels-pok-rie-33563-2049422.jpg",
  "/pexels-yaroslav-shuraev-1834403.jpg",
  "/photo-1478760329108-5c3ed9d495a0.jpeg",
];

const randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];

export default function Authentication() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formState === 0 ? "/api/users/login" : "/api/users/register";
      const data = formState === 0 ? { email, password } : { name, email, password };

      const response = await axios.post(`http://localhost:8000${endpoint}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (formState === 1) {
        // If registering, show success message and switch to login form
        setMessage("User registered successfully! Please login.");
        setOpen(true);
        setEmail("");
        setPassword("");
        setName("");
        setFormState(0);
      } else {
        // If logging in, store token and redirect to home
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong!");
      setOpen(true);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${randomWallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box sx={{ my: 8, mx: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5">{formState === 0 ? "Sign In" : "Sign Up"}</Typography>
            <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
            <Button variant="text" onClick={() => setFormState(formState === 0 ? 1 : 0)}>
              {formState === 0 ? "Create an account" : "Already have an account? Sign in"}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="info">
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
