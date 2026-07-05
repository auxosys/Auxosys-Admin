import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [preferences, setPreferences] = useState({
        newEnquiries: true,
        jobApplications: true,
    });

    return (
        <NotificationContext.Provider value={{ preferences, setPreferences }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationSettings = () =>
    useContext(NotificationContext);
