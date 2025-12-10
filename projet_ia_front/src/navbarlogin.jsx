import './navbar.css';
import { Link } from 'react-router-dom';
export default function Navbarlogin() {
    return (
        <nav className="navigation row">
                <h1 className="navigation_title col-md-6">
                    <div className='d-flex flex-column justify-content-center align-items-start text-center mb-0 mt-1 ms-5'><span>AsMe</span><span>vision</span></div>
                </h1>
                <div className="navigation_links col-md-6 d-flex justify-content-start align-items-center gap-3">
                    <a href="#">Home</a>
                    <div className='navigation_links_second'>
                        <Link to="/historique" className='ms-5'>Mon historique</Link> | <a href="#">Mon compte</a>
                    </div>
                </div>
        </nav>
    );
}
