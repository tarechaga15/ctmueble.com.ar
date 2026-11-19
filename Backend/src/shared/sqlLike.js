/**
 * Escapa caracteres comodín (`\`, `%`, `_`) para consultas SQL `LIKE` / `ILIKE` seguras.
 */
function escapeLike(value) {
  return String(value ?? '').replace(/[\\%_]/g, '\\$&');
}

/**
 * Convierte un índice base-1 (1, 2, ..., 26, 27...) en letras estilo columna (A..Z, AA..ZZ).
 */
function sequenceNumberToLetters(num) {
  let n = Number(num);
  if (!Number.isInteger(n) || n < 1) n = 1;
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

module.exports = {
  escapeLike,
  sequenceNumberToLetters
};
