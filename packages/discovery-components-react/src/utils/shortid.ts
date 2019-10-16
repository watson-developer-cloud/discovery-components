let id = 0;

function shortid(): number {
  if (id === Number.MAX_SAFE_INTEGER) {
    id = 0;
  }
  return id++;
}

export default shortid;
