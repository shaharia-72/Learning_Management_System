import Swal from "sweetalert2";

function Toast() {
    return Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.marginTop = "50px";
        }
    });
}

export default Toast;
