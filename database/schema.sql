CREATE DATABASE IF NOT EXISTS bibliomusic
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bibliomusic;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nome VARCHAR(120) NOT NULL,
  descricao VARCHAR(255),
  cor_capa VARCHAR(20) DEFAULT '#FF2D87',
  imagem_capa LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  playlist_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  artista VARCHAR(150) NOT NULL,
  album VARCHAR(150),
  duracao_segundos INT,
  genero VARCHAR(60),
  ano_lancamento INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

INSERT INTO users (nome, email, senha) VALUES
('Beatriz Ceciliato Robaskievicz da Cunha', 'bia@exemplo.com', '$2b$10$W.PCfz6HX4i.foqbpa7qNeP2MubXzOy4xzh/wVDLgdigBZONwLJ3G');

INSERT INTO playlists (user_id, nome, descricao, cor_capa) VALUES
(1, 'Foco pra estudar', 'Musicas calmas para render nos estudos', '#F472B6'),
(1, 'Treino', 'Playlist energetica para malhar', '#DB2777');

INSERT INTO songs (playlist_id, titulo, artista, album, duracao_segundos, genero, ano_lancamento) VALUES
(1, 'Clair de Lune', 'Debussy', 'Suite bergamasque', 300, 'Classica', 1905),
(1, 'Weightless', 'Marconi Union', 'Weightless', 480, 'Ambient', 2011),
(2, 'Stronger', 'Kanye West', 'Graduation', 311, 'Hip-Hop', 2007),
(2, 'Levels', 'Avicii', 'Levels', 203, 'Eletronica', 2011);
