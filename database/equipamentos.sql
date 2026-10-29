USE rpgcm;

DROP TRIGGER IF EXISTS trg_inventario_desequipar;

CREATE TRIGGER trg_inventario_desequipar
AFTER DELETE ON inventario
FOR EACH ROW
  UPDATE personagem_equipamento pe
  JOIN equipamento e ON e.id_equipamento = pe.id_equipamento
  SET pe.equipado = 0
  WHERE pe.id_personagem = OLD.id_personagem AND e.id_item = OLD.id_item;