import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { CUSTOMER_NAV_LINKS, MAIN_NAV_LINKS, SECONDARY_NAV_LINKS, SETTINGS_NAV_LINKS } from '../../constants/navigationRoutes'
import useCurrentUser from '../../hooks/useCurrentUser'
import useClientData from '../../hooks/useClientData';
import { useGetAccountManagerQuery } from '../../services/api/accountManagerApiSlice'


const Navbar = () => {
  const { account_manager_id, role } = useCurrentUser()
  const { client: clientData } = useClientData();

  // Only fetch if role is "user" and we have an ID
  const { data: agency, isLoading: isAgencyLoading } =
    useGetAccountManagerQuery(account_manager_id, { skip: role !== 'user' });

  const { clientId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()


  let navLinks

  // Check for customer role first
  if (role === 'user') {
    // If a customer, use the customer-specific nav links.
    navLinks = CUSTOMER_NAV_LINKS(clientData?.id).filter(link => link.roles.includes(role));
  } else if (location.pathname.includes('/settings')) {
    navLinks = SETTINGS_NAV_LINKS.filter(link => link.roles.includes(role));
  } else if (clientId) {
    navLinks = SECONDARY_NAV_LINKS(clientId).filter(link => link.roles.includes(role));
  } else {
    navLinks = MAIN_NAV_LINKS.filter(link => link.roles.includes(role));
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="global-navbar d-flex-start">
      <div className="nav-links wrap">
        {navLinks.map((link) => (
          <NavLink
            className={({ isActive }) => {
              // Special case for "Clients" link (path '/')
              if (link.path === '/' && role !== 'user' && location.pathname.includes('/clients')) {
                return 'button-secondary active';
              }
              // Default logic for other links
              return isActive ? 'button-secondary active' : 'button-primary';
            }
            }
            key={link.path}
            to={link.path}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      {role === 'user' && !isAgencyLoading && agency && (
        <div className="navbar-agency">
          Agency: {agency.first_name} {agency.last_name} ({agency.email})
        </div>
      )}
      <button className="logout-btn button-dark" onClick={handleLogout}>Logout</button>
    </nav>
  )
}

export default Navbar
