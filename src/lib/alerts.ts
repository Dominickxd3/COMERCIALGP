import Swal from "sweetalert2";

export function showRefreshSuccess(message = "Datos actualizados correctamente.") {
  return Swal.fire({
    icon: "success",
    title: "Actualización completa",
    text: message,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#0f172a",
  });
}

export function showRefreshWarning(
  message = "No se encontraron datos nuevos. Se mantiene la ultima version disponible.",
) {
  return Swal.fire({
    icon: "warning",
    title: "Sin datos nuevos",
    text: message,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#0f172a",
  });
}

export function showRefreshError(message = "No se pudo actualizar. Intenta nuevamente.") {
  return Swal.fire({
    icon: "error",
    title: "Error al actualizar",
    text: message,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#0f172a",
  });
}
