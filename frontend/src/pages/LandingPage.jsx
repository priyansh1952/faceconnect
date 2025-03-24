import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate(); // ✅ Use inside function component

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>FaceConnect</h2>
                </div>
                <div className="navlist">
                    <p onClick={() => navigate("/q23yu7")}>Join as Guest</p>
                    
                    {/* ✅ Wrap "Register" with Link */}
                    <Link to="/register">
                        <p>Register</p>
                    </Link>

                    <div onClick={() => navigate("/auth")} role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1>
                        <span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones
                    </h1>
                    <p>Cover a distance by FaceConnect</p>
                    <div role="button">
                        <Link to="/auth">Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/5aac37b3cc50292b008b48ab.webp" alt="Landing Page Image" />
                </div>
            </div>
        </div>
    );
}
