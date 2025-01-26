import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa"; // Example icons
import { FaCircleInfo } from "react-icons/fa6";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Social Media Links */}
                <div className="social-links">
                    <a href="https://github.com/JeanEudes-dev" target="_blank" rel="noopener noreferrer" title="GitHub Profile">
                        <FaGithub className="social-icon" />
                    </a>
                    <a href="https://www.linkedin.com/in/jean-eudes-dev" target="_blank" rel="noopener noreferrer" title="LinkedIn Profile">
                        <FaLinkedin className="social-icon" />
                    </a>
                    <a href="https://www.linkedin.com/school/pmaccelerator/" target="_blank" rel="noopener noreferrer" title="PM Accelerator">
                        <FaCircleInfo className="social-icon" />
                    </a>
                </div>

                {/* Copyright Information */}
                <div className="copyright">
                    &copy; {new Date().getFullYear()} Jean-Eudes ASSOGBA. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;