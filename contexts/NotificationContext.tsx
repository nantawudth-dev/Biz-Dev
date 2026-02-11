
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import NotificationModal from '../components/NotificationModal';

type NotificationType = 'success' | 'error' | 'delete';

interface Notification {
    message: string;
    type: NotificationType;
    onCloseCallback?: () => void;
}

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType, onCloseCallback?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType, onCloseCallback?: () => void) => {
        setNotification({ message, type, onCloseCallback });
    }, []);

    const handleClose = () => {
        if (notification?.onCloseCallback) {
            notification.onCloseCallback();
        }
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <NotificationModal
                isOpen={!!notification}
                message={notification?.message || ''}
                type={notification?.type || 'success'}
                onClose={handleClose}
            />
        </NotificationContext.Provider>
    );
};