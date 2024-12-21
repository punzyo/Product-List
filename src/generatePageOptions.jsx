export const generatePageOptions = (totalPages) => {
    const options = [];
    for (let i = 1; i <= totalPages; i++) {
      options.push(
        <option key={i} value={i}>
          第 {i} 頁
        </option>
      );
    }
    return options;
  };