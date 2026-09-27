interface ToastProps {
    message: string | null;
}

export function Toast({ message }: ToastProps) {
    return (
        <div
            id="toastNotification"
            className={`toast-notification${message ? ' show' : ''}`}
            aria-live="polite"
        >
            {message ?? ''}
        </div>
    );
}
