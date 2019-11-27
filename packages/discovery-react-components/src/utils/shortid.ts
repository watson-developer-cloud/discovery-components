let id = 0;

function shortid(): string {
  if (id === Number.MAX_SAFE_INTEGER) {
    id = 0;
  }
  return String(id++);
}

export default shortid;
