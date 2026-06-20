import Swal from "sweetalert2";

const sharedOptions = {
  confirmButtonText: "Cerrar",
  allowOutsideClick: true,
  allowEscapeKey: true,
  showConfirmButton: true,
  timerProgressBar: true,
  heightAuto: false,
};

export function showRefreshSuccess(message = "Datos actualizados correctamente.") {
  return Swal.fire({
    ...sharedOptions,
    icon: "success",
    title: "Actualizacion completa",
    text: message,
    timer: 2500,
  });
}

export function showRefreshWarning(
  message = "No se encontraron datos nuevos. Se mantiene la ultima version disponible.",
) {
  return Swal.fire({
    ...sharedOptions,
    icon: "warning",
    title: "Sin datos nuevos",
    text: message,
    timer: 3500,
  });
}

export function showRefreshError(message = "No se pudo actualizar. Intenta nuevamente.") {
  return Swal.fire({
    ...sharedOptions,
    icon: "error",
    title: "Error al actualizar",
    text: message,
    timer: 4000,
  });
}
