import { useLocation, Link, useParams } from 'react-router-dom';
import UserProfile from './UserProfile';
import Navbar from './Navbar';
import { MAIN_NAV_LINKS } from '../../constants/navigationRoutes';
import { FaPlusSquare } from 'react-icons/fa';
import StatusActionBar from './StatusActionBar';
import ClientName from '../../components/client/ClientName';
import useCurrentUser from '../../hooks/useCurrentUser';

const Header = () => {

  const { clientId } = useParams();
  const location = useLocation()
  const { role } = useCurrentUser(); // Get the user's role

  const currentPath = location.pathname

  const currentNavLink = MAIN_NAV_LINKS.find((link) => {
    // Special case for "Clients" link and its nested routes
    if (link.path === '/' && /^\/clients(\/[-\w]+)*(\/view)?$/.test(currentPath)) {
      return true
    }

    // For other links, use regex to match nested paths ending with '/view'
    const regex = new RegExp(`^${link.path}(/[-\\w]+)*(?!/new)$`)
    return link.path === currentPath || regex.test(currentPath)
  })

  // Extract values for button and page header
  const pageHeader = currentNavLink?.label || 'Default Page Header'
  const buttonText = currentNavLink?.buttonText || ''
  const buttonLink = currentNavLink?.buttonLink || '#'
  const allowedRoles = currentNavLink?.buttonRoles || []

  // Determine if button should be shown
  // const showButton =
  //   Boolean(currentNavLink) &&
  //   buttonText &&
  //   !currentPath.endsWith('/new')
  const showButton =
    Boolean(currentNavLink) &&
    buttonText &&
    !currentPath.endsWith('/new') &&
    allowedRoles.includes(role);



  return (
    <header className="header">
      <div className="header-content">
        <Link to='/'>
          <h1>Dashboard</h1></Link>
        <UserProfile />
      </div>
      <div>
        <ClientName />
        {clientId && <StatusActionBar />}
        <Navbar />
        {currentNavLink && (
          <div className='d-flex d-flex-space-between mb-2 align-center'>
            <h2>{pageHeader}</h2>
            {showButton && (
              <Link to={buttonLink} className="button button-primary d-flex align-center gap-10 border-radius-10 fnt-18 p-gen-btn">
                {buttonText} <FaPlusSquare />
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
