export const insertDropdownInMessage = (message: string, dropdown: JSX.Element) => {
  return message.split('%').map(element => {
    return element === 'dropdown' ? dropdown : <p>{element}</p>;
  });
};
