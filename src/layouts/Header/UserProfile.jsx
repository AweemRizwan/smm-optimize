import { useState, useEffect, useRef } from 'react'
import { FaBell, FaCog } from 'react-icons/fa'
import SkeletonLoader from '../../components/Loader/SkeletonLoader'
import { useGetProfileQuery } from '../../services/api/profileApiSlice'
import userprofile from "../../assets/Images/ProfilePicture.png"
import { NavLink } from 'react-router-dom'
import { formatString } from '../../utils/generalUtils'
import NotificationComponent from '../../components/notification/Notifications'
import { useSelector } from 'react-redux'
import setting from '../../assets/images/setting.png'

const UserProfile = () => {
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationRef = useRef(null)
    const bellIconRef = useRef(null)

    const toggleNotifications = (e) => {
        // Prevent the click from bubbling up to document
        e.stopPropagation()
        setShowNotifications(prev => !prev)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications &&
                notificationRef.current &&
                !notificationRef.current.contains(event.target) &&
                !bellIconRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

    const notifications = useSelector((state) => state.notifications);
    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

    // eslint-disable-next-line no-unused-vars
    const { data: profile, isLoading, isError, error } = useGetProfileQuery()

    if (isLoading) {
        return (
            <div className="user-profile position-relative">
                <SkeletonLoader height={50} width={50} style={{ borderRadius: '50%', marginRight: '10px' }} />
                <div className="user-info">
                    <SkeletonLoader height={20} width={100} />
                    <SkeletonLoader height={15} width={150} style={{ marginTop: '5px' }} />
                </div>
                <div className="user-icons">
                    <div ref={bellIconRef}>
                        <FaBell className="icon bell-icon"
                            onClick={toggleNotifications} />
                    </div>
                    <NavLink to={'/settings/profile'}>
                        <FaCog className="icon settings-icon" />
                    </NavLink>
                </div>
            </div>
        )
    }

    if (isError) {
        console.error('Error fetching profile:', error.message)
    }

    return (
        <div className="user-profile position-relative">
            <img src={profile?.profile || userprofile} alt="User Profile" className="profile-pic border-radius-50" />
            <div className="user-info">
                <span className="user-name">{profile?.first_name} {profile?.last_name}</span>
                <span className="user-role">{formatString(profile?.role)}</span>
            </div>
            <div className="user-icons">
                <div className="notification-icon-container" ref={bellIconRef} style={{ position: 'relative' }} >
                    <FaBell className="icon bell-icon" onClick={toggleNotifications} />
                    {unreadCount > 0 && (
                        <span
                            className="notification-badge"
                            style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '4px 8px',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                width: '15px',
                                height: '15px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {unreadCount}
                        </span>
                    )}
                </div>
                <NavLink to={'/settings/profile'}>
                    {/* <FaCog className="icon settings-icon" /> */}
                    <img width={24} src={setting} alt="setting" className="icon settings-icon" />
                </NavLink>
            </div>
            {showNotifications && (
                <div ref={notificationRef}>
                    <NotificationComponent />
                </div>
            )}
        </div>
    );
};

export default UserProfile
