/**
 * Parsea el texto etiquetado recursivamente para manejar etiquetas anidadas.
 * Devuelve una estructura jerárquica de segmentos.
 */
export const parseTaggedText = (text, model) => {
  const tagMap = {};
  const tagNamesMap = {};

  const processModelPart = (part) => {
    if (part && part.values) {
      part.values.forEach(v => {
        if (v.color) tagMap[v.tag] = v.color;
        tagNamesMap[v.tag] = v.name || v.tag;
      });
    }
  };

  processModelPart(model.entities);
  // Según el usuario, los colores solo vienen en las entidades, pero el modelo
  // podría tener otros. Los mapeamos todos por si acaso.
  processModelPart(model.attributes);
  processModelPart(model.positional_attributes);

  const usedTags = new Set();

  const parseRecursive = (content) => {
    const tagRegex = /<(\w+)(?:\s+[^>]+)?>(.*?)<\/\1>/gs;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      const [fullMatch, tagName, innerContent] = match;
      
      // Texto antes de la etiqueta
      if (match.index > lastIndex) {
        segments.push({ type: 'text', value: content.substring(lastIndex, match.index) });
      }

      const color = tagMap[tagName];
      const children = parseRecursive(innerContent);
      
      if (color) {
        usedTags.add(tagName);
        segments.push({
          type: 'tag',
          tagName,
          displayName: tagNamesMap[tagName],
          color,
          children
        });
      } else {
        // Si no tiene color/no es entidad válida según el usuario, 
        // simplemente añadimos sus hijos al flujo actual (quitando la etiqueta)
        segments.push(...children);
      }

      lastIndex = tagRegex.lastIndex;
    }

    // Texto restante
    if (lastIndex < content.length) {
      segments.push({ type: 'text', value: content.substring(lastIndex) });
    }

    return segments;
  };

  const segments = parseRecursive(text);

  return { 
    segments, 
    usedTagsInfo: Array.from(usedTags).map(tag => ({ 
      tag, 
      name: tagNamesMap[tag],
      color: tagMap[tag]
    })) 
  };
};

export const generateHtmlFileContent = (title, text, model) => {
  const { segments, usedTagsInfo } = parseTaggedText(text, model);

  const renderSegmentsToHtml = (segList) => {
    return segList.map(s => {
      if (s.type === 'tag') {
        const childrenHtml = renderSegmentsToHtml(s.children);
        return `<span class="tag-highlight tag-${s.tagName}" style="background-color: ${s.color}44; border-bottom: 2px solid ${s.color}; color: white;" data-tag="${s.tagName}" title="${s.displayName} (${s.tagName})">${childrenHtml}</span>`;
      }
      return s.value.replace(/\n/g, '<br>');
    }).join('');
  };

  const segmentsHtml = renderSegmentsToHtml(segments);

  const optionsHtml = usedTagsInfo.map(t => 
    `
        <li class="filter-item" onclick="toggleFilter(this, '${t.tag}')" data-tag="${t.tag}">
            <span>${t.name}</span>
            <span class="count">${t.tag}</span>
        </li>
    `
  ).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Documento Etiquetado'}</title>
    <style>
        :root {
            --bg-dark: #0f172a;
            --card-bg: #1e293b;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --primary: #38bdf8;
        }
        body { 
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            display: flex;
            background: var(--bg-dark); 
            color: var(--text-main); 
            height: 100vh;
            overflow: hidden;
        }
        .main-content { flex: 1; overflow-y: auto; padding: 50px; scroll-behavior: smooth; }
        .sidebar {
            width: 320px;
            background: var(--card-bg);
            border-left: 1px solid #334155;
            padding: 24px;
            overflow-y: auto;
        }
        .line-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 24px;
            border: 1px solid #334155;
            position: relative;
            font-size: 1.15rem;
            line-height: 1.8;
            color: #e2e8f0;
            white-space: pre-wrap;
        }
        .tag-highlight {
            padding: 2px 4px;
            border-radius: 4px;
            cursor: help;
            transition: all 0.2s;
        }
        .tag-highlight.active-highlight {
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
            display: inline-block;
            border-color: #fbbf24 !important;
        }
        .tag-highlight:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            filter: brightness(1.2);
        }
        [title] { position: relative; }
        
        .sidebar h2 { font-size: 1.5rem; margin-top: 0; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .filter-section h3 { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-top: 30px; letter-spacing: 0.05em; border-bottom: 1px solid #334155; padding-bottom: 8px; }
        .filter-list { list-style: none; padding: 0; }
        .filter-item {
            padding: 10px 14px;
            margin: 8px 0;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            display: flex;
            justify-content: space-between;
            transition: 0.2s;
        }
        .filter-item:hover { border-color: var(--primary); background: #1e293b; }
        .filter-item.active { background: var(--primary); border-color: var(--primary); color: #0f172a; }
        .count { font-size: 0.7rem; opacity: 0.6; }
        .btn-all { width: 100%; padding: 12px; background: #334155; color: white; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 20px; font-weight: 600; }
        .btn-all:hover { background: #475569; }
    </style>
</head>
<body>
    <div class="main-content">
        <h1>Documento Etiquetado: ${title || 'Sin Título'}</h1>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;"/>
        <div class="line-card" id="mainContent">
            ${segmentsHtml}
        </div>
    </div>
    
    <aside class="sidebar">
        <h2>Filtros</h2>
        <button class="btn-all" onclick="resetFilters()">Mostrar Todo</button>
        <div id="counter" style="margin-bottom: 15px; color: var(--primary); font-size: 0.85rem; font-weight: 600; text-align: center;"></div>

        <div class="filter-section">
            <h3>Etiquetas Encontradas</h3>
            <ul class="filter-list">
                ${optionsHtml}
            </ul>
        </div>
    </aside>

    <script>
        function toggleFilter(el, selectedTag) {
            const isActive = el.classList.contains('active');
            document.querySelectorAll('.filter-item').forEach(item => item.classList.remove('active'));
            
            if (!isActive) {
                el.classList.add('active');
                highlightTags(selectedTag);
            } else {
                resetFilters();
            }
        }

        function highlightTags(selectedTag) {
            const allHighlights = document.querySelectorAll('.tag-highlight');
            allHighlights.forEach(el => {
                el.classList.remove('active-highlight');
                if (selectedTag && el.getAttribute('data-tag') !== selectedTag) {
                    el.style.opacity = '0.3';
                } else {
                    el.style.opacity = '1';
                }
            });

            if (selectedTag) {
                const targets = document.querySelectorAll('.tag-' + selectedTag);
                targets.forEach(el => el.classList.add('active-highlight'));
                
                let counterText = 'Encontradas: ' + targets.length;
                document.getElementById('counter').innerText = counterText;

                if (targets.length > 0) {
                    targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                document.getElementById('counter').innerText = '';
            }
        }

        function resetFilters() {
            document.querySelectorAll('.filter-item').forEach(item => item.classList.remove('active'));
            const allHighlights = document.querySelectorAll('.tag-highlight');
            allHighlights.forEach(el => {
                el.classList.remove('active-highlight');
                el.style.opacity = '1';
            });
            document.getElementById('counter').innerText = '';
        }
    </script>
</body>
</html>
  `;
};
