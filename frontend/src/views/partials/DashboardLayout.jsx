import React, { useState } from 'react';
import BaseHeader from '../partials/BaseHeader';
import BaseFooter from '../partials/BaseFooter';
import BaseSidebar from '../partials/BaseSidebar';

function DashboardLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <>
            <BaseHeader />

            <div className="dashboard-wrapper">
                <BaseSidebar
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                />

                <div className="main-content">
                    {children}
                </div>
            </div>

            <BaseFooter />

            {/* Global styles for dashboard layout */}
            <style>{`
                :root {
                    --sidebar-width: 250px;
                    --sidebar-collapsed-width: 70px;
                }

                .dashboard-wrapper {
                    display: flex;
                    min-height: calc(100vh - 56px);
                }

                .main-content {
                    margin-left: var(--sidebar-width);
                    width: calc(100% - var(--sidebar-width));
                    transition: all 0.3s;
                }

                .sidebar.collapsed + .main-content {
                    margin-left: var(--sidebar-collapsed-width);
                    width: calc(100% - var(--sidebar-collapsed-width));
                }

                @media (max-width: 992px) {
                    .sidebar {
                        transform: translateX(-100%);
                    }

                    .sidebar.collapsed {
                        transform: translateX(0);
                        width: var(--sidebar-collapsed-width);
                    }

                    .main-content {
                        margin-left: 0;
                        width: 100%;
                    }

                    .sidebar.show {
                        transform: translateX(0);
                    }

                    .sidebar.show + .main-content {
                        margin-left: var(--sidebar-width);
                    }
                }
            `}</style>
        </>
    );
}

export default DashboardLayout;