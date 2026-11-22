const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');
const sharp = require('sharp');
const autenticar = require('../middlewares/autenticar');
const { PASTA_UPLOADS } = require('../services/retratos');

const router = express.Router();

router.use(autenticar);

const LIMITE_BYTES = 1024 * 1024;
const LIMITE_POR_USUARIO = 30;

const esquemaImagem = z.object({
  imagem: z.string().max(1500000),
});

function camposInvalidos(resultado) {
  return resultado.error.issues.map((problema) => problema.path.join('.'));
}

router.post('/retrato', async (req, res) => {
  const dados = esquemaImagem.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const texto = dados.data.imagem;
  const separador = texto.indexOf(',');
  const cabecalho = separador === -1 ? '' : texto.slice(0, separador);
  if (!/^data:image\/(png|jpeg|webp);base64$/.test(cabecalho)) {
    return res.status(400).json({ erro: 'Envie uma imagem PNG, JPG ou WEBP' });
  }

  const buffer = Buffer.from(texto.slice(separador + 1), 'base64');
  if (buffer.length === 0 || buffer.length > LIMITE_BYTES) {
    return res.status(400).json({ erro: 'Imagem muito grande (máximo de 1 MB)' });
  }

  let saida;
  try {
    saida = await sharp(buffer, { limitInputPixels: 16000000 })
      .rotate()
      .resize(400, 400, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (erro) {
    return res.status(400).json({ erro: 'O arquivo enviado não é uma imagem válida' });
  }

  try {
    await fs.promises.mkdir(PASTA_UPLOADS, { recursive: true });

    const prefixo = `upload-${req.usuario.id_usuario}-`;
    const existentes = await fs.promises.readdir(PASTA_UPLOADS);
    const doUsuario = existentes.filter((nome) => nome.startsWith(prefixo));
    if (doUsuario.length >= LIMITE_POR_USUARIO) {
      return res
        .status(409)
        .json({ erro: 'Limite de imagens enviadas atingido. Use uma das já enviadas.' });
    }

    const nome = prefixo + crypto.randomBytes(8).toString('hex');
    await fs.promises.writeFile(path.join(PASTA_UPLOADS, `${nome}.jpg`), saida);

    res.status(201).json({ retrato: nome });
  } catch (erro) {
    console.error('Erro ao enviar retrato:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;