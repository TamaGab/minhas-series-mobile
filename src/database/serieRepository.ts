import type {
  CreateSerieInput,
  Serie,
  SerieFilter,
  SerieSortOrder,
  UpdateSerieInput,
} from '../types/serie';
import { getDatabase } from './database';

export async function getSeries(
  filtro: SerieFilter,
  busca: string,
  ordenacao: SerieSortOrder
): Promise<Serie[]> {
  const database = await getDatabase();
  const conditions: string[] = [];
  const parameters: (string | number)[] = [];

  if (filtro !== 'todas') {
    conditions.push('concluida = ?');
    parameters.push(filtro === 'concluidas' ? 1 : 0);
  }

  const titulo = busca.trim();
  if (titulo.length > 0) {
    conditions.push('titulo LIKE ? COLLATE NOCASE');
    parameters.push(`%${titulo}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderClause =
    ordenacao === 'maior-nota'
      ? 'CASE WHEN nota IS NULL THEN 1 ELSE 0 END ASC, nota DESC, createdAt DESC, id DESC'
      : 'createdAt DESC, id DESC';

  return database.getAllAsync<Serie>(
    `SELECT * FROM series ${whereClause} ORDER BY ${orderClause}`,
    ...parameters
  );
}

export async function getSeriesSummary(): Promise<{ total: number; concluidas: number }> {
  const database = await getDatabase();
  const summary = await database.getFirstAsync<{ total: number; concluidas: number }>(
    'SELECT COUNT(*) AS total, COUNT(CASE WHEN concluida = 1 THEN 1 END) AS concluidas FROM series'
  );

  return summary ?? { total: 0, concluidas: 0 };
}

export async function getSerieById(id: number): Promise<Serie | null> {
  const database = await getDatabase();
  return database.getFirstAsync<Serie>('SELECT * FROM series WHERE id = ?', id);
}

export async function createSerie(input: CreateSerieInput): Promise<Serie> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO series (titulo, plataforma, temporadas, nota, createdAt) VALUES (?, ?, ?, ?, ?)',
    input.titulo,
    input.plataforma,
    input.temporadas,
    input.nota,
    new Date().toISOString()
  );

  const serie = await getSerieById(result.lastInsertRowId);
  if (serie === null) {
    throw new Error('Não foi possível encontrar a série recém-criada.');
  }

  return serie;
}

export async function updateSerie(id: number, input: UpdateSerieInput): Promise<void> {
  if (
    input.titulo === undefined &&
    input.plataforma === undefined &&
    input.temporadas === undefined &&
    input.nota === undefined
  ) {
    if ((await getSerieById(id)) === null) {
      throw new Error('Série não encontrada.');
    }
    return;
  }

  const database = await getDatabase();
  const result = await database.runAsync(
    `UPDATE series
     SET titulo = COALESCE(?, titulo),
         plataforma = COALESCE(?, plataforma),
         temporadas = COALESCE(?, temporadas),
         nota = CASE WHEN ? = 1 THEN ? ELSE nota END
     WHERE id = ?`,
    input.titulo ?? null,
    input.plataforma ?? null,
    input.temporadas ?? null,
    input.nota === undefined ? 0 : 1,
    input.nota ?? null,
    id
  );

  if (result.changes === 0) {
    throw new Error('Série não encontrada.');
  }
}

export async function toggleSerieConcluida(id: number): Promise<void> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'UPDATE series SET concluida = CASE WHEN concluida = 0 THEN 1 ELSE 0 END WHERE id = ?',
    id
  );

  if (result.changes === 0) {
    throw new Error('Série não encontrada.');
  }
}

export async function deleteSerie(id: number): Promise<void> {
  const database = await getDatabase();
  const result = await database.runAsync('DELETE FROM series WHERE id = ?', id);

  if (result.changes === 0) {
    throw new Error('Série não encontrada.');
  }
}
