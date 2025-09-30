import PostCard from "../../components/shared/PostCard";
import { useParams } from "react-router-dom";
import { useFetchClientCalendarQuery } from "../../services/api/calendarMonthlyViewApiSlice";
import { useUpdateCalendarDateMutation } from "../../services/api/calendarApiSlice";
import useCurrentUser from "../../hooks/useCurrentUser";
import Header from '../../layouts/Header/Header'
import { useState, useEffect } from 'react';
import {
  ErrorContainer,
  SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const CalendarMonthlyView = () => {
    const { businessName, accountManagerName, yearMonth } = useParams();
    const { role } = useCurrentUser();
    const [updateCalendarDate] = useUpdateCalendarDateMutation();
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [localPosts, setLocalPosts] = useState([]);

    const { data: calendarPosts = [], error, isLoading, refetch } = useFetchClientCalendarQuery({
        clientBusinessName: businessName,
        accountManagerUsername: accountManagerName,
        monthName: yearMonth,
    });

    // Sync local state with API data
    useEffect(() => {
        if (calendarPosts.length > 0) {
            // Transform media data to ensure it's always an array
            const transformedPosts = calendarPosts.map(post => ({
                ...post,
                creatives: Array.isArray(post.creatives) ? post.creatives : [post.creatives].filter(Boolean),
                creativesType: post.creativesType || 'image' // default to image if not specified
            }));
            setLocalPosts(transformedPosts);
        }
    }, [calendarPosts]);

    const handleClientApproval = async (id, _scopeKey, field) => {
        const post = localPosts.find(p => p.id === id);
        if (!post) return;
    
        // build toggled approval
        const updated = {
          ...(post.client_approval || {}),
          [field]: !post.client_approval?.[field],
        };
    
        // optimistic UI
        setLocalPosts(ps =>
          ps.map(p => p.id === id
            ? { ...p, client_approval: updated }
            : p
          )
        );
    
        try {
          await updateCalendarDate({
            calendarId: post.calendar,
            dateId:       id,
            data:         { client_approval: updated },
          }).unwrap();
    
          setSuccessMessage(
            updated[field]
              ? `Client ${field === 'content_approval' ? 'content' : 'creative'} approved`
              : `Client ${field === 'content_approval' ? 'content' : 'creative'} approval removed`
          );
          setErrorMessage(null);
        } catch (err) {
          console.error(err);
          setErrorMessage('Failed to update client approval.');
          // rollback
          setLocalPosts(ps =>
            ps.map(p => p.id === id
              ? { ...p, client_approval: post.client_approval }
              : p
            )
          );
        }
      };

    // if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="container">
            {/* <Header /> */}
            <div className="section container">
                <div className="calendar-monthly-view">
                    <h1 className="mb-5 text-center">Monthly Calendar View</h1>

                    <ToastContainer>
                        {successMessage && (
                            <SuccessContainer
                                message={successMessage}
                                onClose={() => setSuccessMessage(null)}
                            />
                        )}
                        {errorMessage && (
                            <ErrorContainer
                                message={errorMessage}
                                onClose={() => setErrorMessage(null)}
                            />
                        )}
                    </ToastContainer>

                    {localPosts.map((post, index) => (
                        <PostCard
                            key={post.id}
                            post={{
                                ...post,
                                // Ensure creatives is always an array
                                creatives: Array.isArray(post.creatives) ? post.creatives : [post.creatives].filter(Boolean),
                            }}
                            isEven={index % 2 === 0}
                            role={role}
                            onClientApproval={handleClientApproval}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarMonthlyView;