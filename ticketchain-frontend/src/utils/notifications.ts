import { toast } from 'sonner';

export const notify = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: '#000',
        color: '#fff',
        border: '1px solid #333',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      style: {
        background: '#fff',
        color: '#000',
        border: '1px solid #000',
      },
    });
  },

  info: (message: string) => {
    toast.info(message, {
      style: {
        background: '#f9fafb',
        color: '#000',
        border: '1px solid #e5e7eb',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#f9fafb',
        color: '#000',
        border: '1px solid #e5e7eb',
      },
    });
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => {
    return toast.promise(promise, messages);
  },
};
