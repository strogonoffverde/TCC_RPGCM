USE rpgcm;

ALTER TABLE personagem
  ADD COLUMN retrato VARCHAR(40) NULL AFTER descricao;