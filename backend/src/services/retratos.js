const fs = require('fs');
const path = require('path');

const TOTAL_RETRATOS = 36;

const RETRATOS = Array.from({ length: TOTAL_RETRATOS }, (_, indice) =>
  `retrato-${String(indice + 1).padStart(2, '0')}`
);

const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'uploads', 'retratos');
const PADRAO_UPLOAD = /^upload-(\d+)-[a-f0-9]{16}$/;

function retratoPermitido(valor, idUsuario) {
  if (RETRATOS.includes(valor)) {
    return true;
  }
  const achado = PADRAO_UPLOAD.exec(valor);
  if (!achado || Number(achado[1]) !== Number(idUsuario)) {
    return false;
  }
  return fs.existsSync(path.join(PASTA_UPLOADS, `${valor}.jpg`));
}

function validarRetrato(req, res, next) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }
  const valor = req.body ? req.body.retrato : undefined;
  if (valor === undefined || valor === null) {
    return next();
  }
  if (typeof valor !== 'string' || !retratoPermitido(valor, req.usuario.id_usuario)) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: ['retrato'] });
  }
  next();
}

module.exports = { RETRATOS, PASTA_UPLOADS, retratoPermitido, validarRetrato };