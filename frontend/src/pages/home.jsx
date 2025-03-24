import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  Container,
  Paper,
  Box,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../contexts/AuthContext";

const HomeComponent = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (meetingCode.trim()) {
      try {
        await addToUserHistory(meetingCode); // Add meeting code to user history
        navigate(`/${meetingCode}`); // Navigate to the meeting room
      } catch (error) {
        console.error("Failed to join video call:", error);
        alert("An error occurred while joining the meeting. Please try again.");
      }
    } else {
      alert("Please enter a valid meeting code.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="sticky" sx={{ bgcolor: "#1976d2" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            FaceConnect
          </Typography>
          <Box>
            <IconButton onClick={() => navigate("/history")} sx={{ color: "#fff" }}>
              <RestoreIcon />
            </IconButton>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
        <Paper elevation={6} sx={{ p: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
            Connect Seamlessly with FaceConnect
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "gray" }}>
            Enter a meeting code to join or create a new meeting.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
            <TextField
              label="Meeting Code"
              variant="outlined"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              sx={{ width: "60%" }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideoCallIcon />}
              onClick={handleJoinVideoCall}
              sx={{ px: 3, height: "56px" }}
            >
              Join
            </Button>
          </Box>
          {/* Subtle Image Section */}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <img
              src="/logo3.png"
              alt="Video Call"
              width="200px"
              style={{ borderRadius: "10px", opacity: 0.9 }}
            />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default withAuth(HomeComponent);