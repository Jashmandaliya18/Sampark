import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore.js';

export const useMobileNavigation = (isMobile) => {
    const { selectedUser, setSelectedUser } = useChatStore();

    useEffect(() => {
        if (!isMobile) return;

        // When a chat is opened on mobile, push a history state
        if (selectedUser) {
            window.history.pushState({ chatOpen: true, userId: selectedUser._id }, '');
        }

        const handlePopState = (event) => {
            if (selectedUser) {
                // Return to contacts list when user presses Android/browser back button
                setSelectedUser(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [selectedUser, isMobile, setSelectedUser]);

    const handleBack = () => {
        if (window.history.state?.chatOpen) {
            window.history.back();
        } else {
            setSelectedUser(null);
        }
    };

    return { handleBack };
};
