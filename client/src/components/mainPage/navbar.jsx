import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/navbar.css";

function Navbar() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Eğer token varsa giriş yapmış demektir
}, []);

const handleLogout = () => {
  localStorage.removeItem("token"); // Çıkış yapınca token'ı sil
  setIsLoggedIn(false);
  navigate('/login');
};

  return (
    <nav className="navbar">
      <div className="logo"><img className="brand-ico" src="https://www.svgrepo.com/show/423832/star-origami-paper.svg" alt="" />| Visual AI</div>
      <ul className={menuOpen ? "nav-links open" : "nav-links"}>
        <li><a href="/">Home</a></li>
        <li><a href="/services">Discover</a></li>
        <li><a href="/about">About</a></li>
        {!isLoggedIn && <li><a href="/login">Login</a></li>}
        {isLoggedIn && <li><a onClick={handleLogout}>Logout</a></li>}
      </ul>
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </nav>
  );
}

export default Navbar;
