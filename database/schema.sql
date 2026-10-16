USE rpgcm;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS personagem_equipamento, equipamento, personagem_habilidade,
  habilidade, inventario, item, atributos, personagem, classe, raca, usuario;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE raca (
  id_raca INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  bonus_forca INT NOT NULL DEFAULT 0,
  bonus_destreza INT NOT NULL DEFAULT 0,
  bonus_constituicao INT NOT NULL DEFAULT 0,
  bonus_inteligencia INT NOT NULL DEFAULT 0,
  bonus_sabedoria INT NOT NULL DEFAULT 0,
  bonus_carisma INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE classe (
  id_classe INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  vida_base INT NOT NULL,
  mana_base INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE personagem (
  id_personagem INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_raca INT NOT NULL,
  id_classe INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  nivel INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  descricao TEXT,
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_personagem_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
  CONSTRAINT fk_personagem_raca FOREIGN KEY (id_raca) REFERENCES raca (id_raca),
  CONSTRAINT fk_personagem_classe FOREIGN KEY (id_classe) REFERENCES classe (id_classe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE atributos (
  id_atributo INT AUTO_INCREMENT PRIMARY KEY,
  id_personagem INT NOT NULL,
  forca INT NOT NULL DEFAULT 10,
  destreza INT NOT NULL DEFAULT 10,
  constituicao INT NOT NULL DEFAULT 10,
  inteligencia INT NOT NULL DEFAULT 10,
  sabedoria INT NOT NULL DEFAULT 10,
  carisma INT NOT NULL DEFAULT 10,
  UNIQUE KEY uq_atributos_personagem (id_personagem),
  CONSTRAINT fk_atributos_personagem FOREIGN KEY (id_personagem)
    REFERENCES personagem (id_personagem) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE item (
  id_item INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventario (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY,
  id_personagem INT NOT NULL,
  id_item INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_inventario_personagem_item (id_personagem, id_item),
  CONSTRAINT fk_inventario_personagem FOREIGN KEY (id_personagem)
    REFERENCES personagem (id_personagem) ON DELETE CASCADE,
  CONSTRAINT fk_inventario_item FOREIGN KEY (id_item) REFERENCES item (id_item)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE habilidade (
  id_habilidade INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  custo_mana INT NOT NULL DEFAULT 0,
  nivel_minimo INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE personagem_habilidade (
  id_personagem_habilidade INT AUTO_INCREMENT PRIMARY KEY,
  id_personagem INT NOT NULL,
  id_habilidade INT NOT NULL,
  nivel_habilidade INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_personagem_habilidade (id_personagem, id_habilidade),
  CONSTRAINT fk_ph_personagem FOREIGN KEY (id_personagem)
    REFERENCES personagem (id_personagem) ON DELETE CASCADE,
  CONSTRAINT fk_ph_habilidade FOREIGN KEY (id_habilidade) REFERENCES habilidade (id_habilidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE equipamento (
  id_equipamento INT AUTO_INCREMENT PRIMARY KEY,
  id_item INT NOT NULL,
  bonus_ataque INT NOT NULL DEFAULT 0,
  bonus_defesa INT NOT NULL DEFAULT 0,
  bonus_atributo VARCHAR(50) NULL,
  bonus_atributo_valor INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_equipamento_item FOREIGN KEY (id_item) REFERENCES item (id_item)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE personagem_equipamento (
  id_personagem_equipamento INT AUTO_INCREMENT PRIMARY KEY,
  id_personagem INT NOT NULL,
  id_equipamento INT NOT NULL,
  equipado BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_personagem_equipamento (id_personagem, id_equipamento),
  CONSTRAINT fk_pe_personagem FOREIGN KEY (id_personagem)
    REFERENCES personagem (id_personagem) ON DELETE CASCADE,
  CONSTRAINT fk_pe_equipamento FOREIGN KEY (id_equipamento) REFERENCES equipamento (id_equipamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;