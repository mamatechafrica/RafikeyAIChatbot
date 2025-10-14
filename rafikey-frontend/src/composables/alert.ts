import Swal from 'sweetalert2'

interface SweetAlertType {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export const showSweetAlert = (alertPayload: SweetAlertType) => {
  if (alertPayload.type === 'success') {
    Swal.fire({
      title: 'Success',
      text: alertPayload.message,
      icon: 'success',
      confirmButtonText: 'Okay',
      timer: 3000,
    })
  } else if (alertPayload.type === 'error') {
    Swal.fire({
      title: 'Error',
      text: alertPayload.message,
      icon: 'error',
      confirmButtonText: 'Okay',
      timer: 3000,
    })
  } else if (alertPayload.type === 'info') {
    Swal.fire({
      title: 'Info',
      text: alertPayload.message,
      icon: 'info',
      confirmButtonText: 'Okay',
      timer: 3000,
    })
  } else {
    Swal.fire({
      title: 'warning',
      text: alertPayload.message,
      icon: 'warning',
      confirmButtonText: 'Okay',
      timer: 3000,
    })
  }
}
