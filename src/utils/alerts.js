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


const sanitizeText = (text) => {
  if (!text) return '';
  return String(text).normalize('NFC');
};

export const showAlert = {
  success: (message, title = 'Sucesso!') => 
    Toast.fire({
      title: sanitizeText(title),
      html: sanitizeText(message),
      icon: 'success'
    }),

  error: (message, title = 'Erro!') => 
    Toast.fire({
      title: sanitizeText(title),
      html: sanitizeText(message),
      icon: 'error'
    }),

  warning: (message, title = 'Aviso!') => 
    Toast.fire({
      title: sanitizeText(title),
      html: sanitizeText(message),
      icon: 'warning'
    }),

  info: (message, title = 'Informação') => 
    Toast.fire({
      title: sanitizeText(title),
      html: sanitizeText(message),
      icon: 'info'
    }),

  confirm: (message, title = 'Confirmar') => 
    Toast.fire({
      title: sanitizeText(title),
      html: sanitizeText(message),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }),

  custom: (options) => {
    const sanitizedOptions = { ...options };
    if (sanitizedOptions.title) {
      sanitizedOptions.title = sanitizeText(sanitizedOptions.title);
    }
    if (sanitizedOptions.text) {
      sanitizedOptions.html = sanitizeText(sanitizedOptions.text);
      delete sanitizedOptions.text;
    }
    if (sanitizedOptions.html) {
      sanitizedOptions.html = sanitizeText(sanitizedOptions.html);
    }
    return Toast.fire(sanitizedOptions);
  }
};

export const confirmDelete = async (itemName, deleteFunction) => {
  const result = await Toast.fire({
    title: 'Confirmar Exclusão',
    html: `Você tem certeza que deseja deletar <strong>${sanitizeText(itemName)}</strong>?`,
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