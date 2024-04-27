import './navbar.css';
const Navbar=()=>{
    return (
        <nav className="header">
            <div className='nav-logo'>
                <h2>Gymify</h2>
            </div>
            <ul className='nav-menu'>
                <li>Home</li>
                <li>About Us</li>
                <li>Features</li>
                <li>Contact Us</li>
            </ul>
            <div className='nav-buttons'>
                <button className='login'>Login</button>
                <button className='register'>Register Now</button>
            </div>
        </nav>
    )
}

export default Navbar