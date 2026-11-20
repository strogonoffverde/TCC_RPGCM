const TOTAL_RETRATOS = 36;

const RETRATOS = Array.from({ length: TOTAL_RETRATOS }, (_, indice) =>
  `retrato-${String(indice + 1).padStart(2, '0')}`
);

module.exports = { RETRATOS };