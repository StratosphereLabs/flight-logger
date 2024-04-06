import { useToaster } from 'react-hot-toast/headless';
import { Outlet } from 'react-router-dom';
import { MainFooter } from './MainFooter';
import { MainNavbar } from './MainNavbar';

export const MainLayout = (): JSX.Element => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, updateHeight } = handlers;
  return (
    <div className="flex h-screen flex-col justify-between">
      <MainNavbar />
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-scroll bg-base-100 p-2 scrollbar-none scrollbar-track-base-100 scrollbar-thumb-neutral sm:p-3 sm:scrollbar">
        <Outlet />
      </div>
      <MainFooter />
      {toasts.length > 0 ? (
        <div
          className="toast toast-end toast-top z-50 w-1/2 min-w-[400px]"
          onMouseEnter={startPause}
          onMouseLeave={endPause}
        >
          {toasts.map(toast => (
            <div
              key={toast.id}
              ref={el => {
                if (el !== null && typeof toast.height !== 'number') {
                  const height = el.getBoundingClientRect().height;
                  updateHeight(toast.id, height);
                }
              }}
              {...toast.ariaProps}
            >
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
