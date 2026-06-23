import Swal from "sweetalert2";

const toastOptions = {
  toast: true,
  position: "top-end" as const,
  showConfirmButton: false,
  timerProgressBar: true,
};

export function showRefreshSuccess(message = "Datos actualizados correctamente.") {
  return Swal.fire({
    ...toastOptions,
    icon: "success",
    title: message,
    timer: 2500,
  });
}

export function showRefreshWarning(
  message = "No se encontraron datos nuevos. Se mantiene la ultima version disponible.",
) {
  return Swal.fire({
    ...toastOptions,
    icon: "warning",
    title: message,
    timer: 3500,
  });
}

export function showRefreshError(message = "No se pudo actualizar. Intenta nuevamente.") {
  return Swal.fire({
    ...toastOptions,
    icon: "error",
    title: message,
    timer: 4000,
  });
}
