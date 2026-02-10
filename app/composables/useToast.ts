export const useToast = () => {
  const toastState = useState('toast', () => ({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  }))

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    toastState.value = {
      show: true,
      message,
      type
    }
  }

  const success = (message: string) => showToast(message, 'success')
  const error = (message: string) => showToast(message, 'error')
  const info = (message: string) => showToast(message, 'info')
  const warning = (message: string) => showToast(message, 'warning')

  return {
    toastState,
    showToast,
    success,
    error,
    info,
    warning
  }
}
