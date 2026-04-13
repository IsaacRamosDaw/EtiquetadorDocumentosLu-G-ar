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

/**
 * Genera el string HTML completo para ser descargado como archivo.
 * También usa recursión para construir el contenido.
 */
export const generateHtmlFileContent = (title, text, model) => {
  const { segments, usedTagsInfo } = parseTaggedText(text, model);

  const renderSegmentsToHtml = (segList) => {
    return segList.map(s => {
      if (s.type === 'tag') {
        const childrenHtml = renderSegmentsToHtml(s.children);
        return `<span class="tag-highlight tag-${s.tagName}" style="background-color: ${s.color}33; border-bottom: 2px solid ${s.color};" data-tag="${s.tagName}">${childrenHtml}</span>`;
      }
      return s.value.replace(/\n/g, '<br>');
    }).join('');
  };

  const segmentsHtml = renderSegmentsToHtml(segments);

  const optionsHtml = usedTagsInfo.map(t => 
    `<option value="${t.tag}">${t.name} (${t.tag})</option>`
  ).join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Documento Etiquetado'}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .controls {
            margin-bottom: 30px;
            background: #f1f3f5;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        select {
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ced4da;
            font-size: 14px;
        }
        .content {
            white-space: pre-wrap;
            font-size: 16px;
            background: #fff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 4px;
        }
        .tag-highlight {
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .tag-highlight.active-highlight {
            outline: 2px solid #000;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            transform: scale(1.05);
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title || 'Documento Etiquetado'}</h1>
        
        <div class="controls">
            <label for="tagSelector">Filtrar por etiqueta:</label>
            <select id="tagSelector" onchange="highlightTags(this.value)">
                <option value="">Todas las etiquetas</option>
                ${optionsHtml}
            </select>
            <span id="counter" style="margin-left: auto; color: #666; font-size: 14px;"></span>
        </div>

        <div class="content" id="mainContent">
            ${segmentsHtml}
        </div>
    </div>

    <script>
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
                document.getElementById('counter').innerText = 'Encontradas: ' + targets.length;
                if (targets.length > 0) {
                    targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                document.getElementById('counter').innerText = '';
            }
        }
    </script>
</body>
</html>
  `;
};
