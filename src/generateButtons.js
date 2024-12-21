export const generateButtons = (currentPage, totalPages) => {
    const buttons = [];

    if (currentPage > 1) buttons.push('<');

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    buttons.push(1);
    if (startPage > 2) buttons.push('...');
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }

    if (endPage < totalPages - 1) buttons.push('...');
    if (totalPages > 1) buttons.push(totalPages);
    if (currentPage < totalPages) buttons.push('>');

    return buttons;
  };