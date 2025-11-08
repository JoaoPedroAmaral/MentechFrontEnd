import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  background: '#2d3748',
  color: 'white',
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#ef4444',
  customClass: {
    container: 'electron-swal-container',
    popup: 'electron-swal-popup',
    title: 'electron-swal-title',
    content: 'electron-swal-content',
    confirmButton: 'electron-swal-confirm-btn',
    cancelButton: 'electron-swal-cancel-btn'
  }
});

export const showAlert = {
  success: (message, title = 'Sucesso!') => 
    Toast.fire(title, message, 'success'),

  error: (message, title = 'Erro!') => 
    Toast.fire(title, message, 'error'),

  warning: (message, title = 'Aviso!') => 
    Toast.fire(title, message, 'warning'),

  info: (message, title = 'Informação') => 
    Toast.fire(title, message, 'info'),

  // Confirmação
  confirm: (message, title = 'Confirmar') => 
    Toast.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }),

  // Personalizado
  custom: (options) => Toast.fire(options)
};

export const confirmDelete = async (itemName, deleteFunction) => {
  const result = await Toast.fire({
    title: 'Confirmar Exclusão',
    html: `Você tem certeza que deseja deletar <strong>${itemName}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, deletar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      icon: 'swal-icon',
      confirmButton: 'swal-confirm-delete-btn',
      cancelButton: 'swal-cancel-btn'
    }
  });

  if (result.isConfirmed) {
    try {
      await deleteFunction();
      await showAlert.success('Item removido com sucesso!');
      return true;
    } catch (error) {
      await showAlert.error(error.message || 'Falha ao deletar');
      return false;
    }
  }
  return false;
};
