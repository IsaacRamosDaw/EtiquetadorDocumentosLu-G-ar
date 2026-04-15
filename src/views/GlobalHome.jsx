import { useNavigate } from 'react-router-dom';

export default function GlobalHome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Sistema de Etiquetado</h1>
        <p style={styles.subtitle}>Selecciona el módulo que deseas utilizar</p>
      </header>

      <div style={styles.cardsContainer}>
        {/* Documentos */}
        <div style={styles.card} onClick={() => navigate('/documentos')}>
          <div style={styles.iconWrapper}>
            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 style={styles.cardTitle}>Documentos</h2>
        </div>

        {/* Entrevistas */}
        <div style={styles.card} onClick={() => navigate('/entrevistas')}>
          <div style={styles.iconWrapper}>
            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h2 style={styles.cardTitle}>Entrevistas</h2>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    color: '#F9FAFB',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: '-webkit-linear-gradient(45deg, #3B82F6, #8B5CF6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#9CA3AF',
  },
  cardsContainer: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '1000px',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: '1rem',
    padding: '2.5rem',
    width: '320px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid #374151',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconWrapper: {
    backgroundColor: '#374151',
    padding: '1rem',
    borderRadius: '50%',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '3rem',
    height: '3rem',
    color: '#60A5FA',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  cardDesc: {
    color: '#9CA3AF',
    lineHeight: '1.5',
    fontSize: '0.95rem',
  }
};
