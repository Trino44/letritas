import type React from 'react';
import { useMemo, useState } from 'react';
import { ALL_LETTERS } from '@/content/letters';
import {
  clearProgress,
  getActivities,
  getAttempts,
  LEVEL_LABEL,
  type Level,
} from '@/services/progress';
import { buildReport, relativeDay } from '@/services/report';

interface Props {
  level: Level;
  onChangeLevel: (level: Level) => void;
  onExit: () => void;
}

const LEVELS: Level[] = ['facil', 'normal', 'dificil'];
const WEEKDAY = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function fmt(n: number | null, digits = 1): string {
  return n === null ? '—' : n.toFixed(digits).replace(/\.0$/, '');
}

/** Panel para papás: qué practicó, cuánto y cómo le fue. */
export const ParentScreen: React.FC<Props> = ({
  level,
  onChangeLevel,
  onExit,
}) => {
  const [version, setVersion] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const now = Date.now();
  const report = useMemo(
    () => buildReport(ALL_LETTERS, getAttempts(), getActivities(), Date.now()),
    // Se recalcula al borrar.
    [version]
  );
  const maxDay = Math.max(1, ...report.days.map((d) => d.traces + d.games));

  return (
    <div className="parent-screen">
      <header className="trace-bar">
        <button
          type="button"
          className="icon-btn"
          onClick={onExit}
          aria-label="Regresar"
        >
          ⬅️
        </button>
        <h1 className="syl-title">Para papás</h1>
        <span className="icon-spacer" />
      </header>

      <div className="parent-body">
        <section className="parent-cards">
          <div className="stat">
            <span className="stat-icon">✏️</span>
            <strong>{report.totalTraces}</strong>
            <span>letras trazadas</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🎮</span>
            <strong>{report.totalGames}</strong>
            <span>juegos terminados</span>
          </div>
          <div className="stat">
            <span className="stat-icon">⏱️</span>
            <strong>{report.tracingMinutes}</strong>
            <span>minutos trazando</span>
          </div>
        </section>

        <section className="parent-section">
          <h2>Últimos 7 días</h2>
          <div className="days" role="img" aria-label="Actividades por día">
            {report.days.map((d) => {
              const total = d.traces + d.games;
              const weekday = WEEKDAY[new Date(`${d.date}T12:00:00`).getDay()];
              return (
                <div key={d.date} className="day">
                  <span className="day-count">{total || ''}</span>
                  <div className="day-bar-wrap">
                    <div
                      className="day-bar"
                      style={{ height: `${(total / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="day-label">{weekday}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="parent-section">
          <h2>Letras</h2>
          <table className="parent-table">
            <thead>
              <tr>
                <th>Letra</th>
                <th>Veces</th>
                <th>Última vez</th>
                <th>Salidas del camino (últimas 5)</th>
              </tr>
            </thead>
            <tbody>
              {report.letters.map((l) => (
                <tr key={l.id} className={l.count === 0 ? 'muted' : ''}>
                  <td className="letter-cell">{l.char}</td>
                  <td>{l.count}</td>
                  <td>{relativeDay(l.lastAt, now)}</td>
                  <td>{fmt(l.recentOffPath)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="parent-section">
          <h2>Juegos</h2>
          <table className="parent-table">
            <thead>
              <tr>
                <th>Juego</th>
                <th>Partidas</th>
                <th>Última vez</th>
                <th>Errores por partida (últimas 5)</th>
              </tr>
            </thead>
            <tbody>
              {report.games.map((g) => (
                <tr key={g.id} className={g.plays === 0 ? 'muted' : ''}>
                  <td>{g.title}</td>
                  <td>{g.plays}</td>
                  <td>{relativeDay(g.lastAt, now)}</td>
                  <td>{fmt(g.recentErrors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="parent-note">
            Menos salidas del camino y menos errores con el tiempo indican que
            va mejorando.
          </p>
        </section>

        <section className="parent-section">
          <h2>Ajustes</h2>
          <div className="parent-row">
            <span>Nivel de trazado:</span>
            <div className="segmented" role="radiogroup" aria-label="Nivel">
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  role="radio"
                  aria-checked={level === lv}
                  className={level === lv ? 'seg active' : 'seg'}
                  onClick={() => onChangeLevel(lv)}
                >
                  {LEVEL_LABEL[lv]}
                </button>
              ))}
            </div>
          </div>
          <div className="parent-row">
            {confirmClear ? (
              <>
                <span>¿Borrar todo el progreso? No se puede deshacer.</span>
                <button
                  type="button"
                  className="big-btn danger"
                  onClick={() => {
                    clearProgress();
                    setConfirmClear(false);
                    setVersion((v) => v + 1);
                  }}
                >
                  Sí, borrar
                </button>
                <button
                  type="button"
                  className="big-btn secondary"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="link-btn"
                onClick={() => setConfirmClear(true)}
              >
                Borrar progreso…
              </button>
            )}
          </div>
          <p className="parent-note">
            Todo se guarda solo en este dispositivo. Letritas es un complemento
            educativo y no sustituye la evaluación de un terapeuta de lenguaje.
          </p>
        </section>
      </div>
    </div>
  );
};
